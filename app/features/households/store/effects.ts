import { HouseholdModel } from "@urban-jungle/shared/models/household";
import { IErr } from "@urban-jungle/shared/utils/err";
import firebase from "firebase";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { AsyncStorage, Share } from "react-native";
import { v4 as uuid } from "uuid";
import { database } from "../../../database";
import { makeHouseholdInvitationDeepLink } from "../../../linking/household-invitation";
import { selectCurrentUserId } from "../../auth/store/state";
import { addHouseholdToCurrentProfile } from "../../profiles/store/effects";
import { setSelectedHouseholdId } from "./state";

/**
 * Creates a new household. Subsequently adds the current user relation to it.
 */
export const createHouseholdForProfile = (
  household: Partial<
    Omit<HouseholdModel, "id" | "dateCreated">
  > = defaultHousehold,
) => (profileId: string): TE.TaskEither<IErr, HouseholdModel> =>
  pipe(
    TE.right({
      ...defaultHousehold,
      ...household,
      id: uuid(),
      dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
    }),
    TE.chainFirst((household) =>
      TE.tryCatch(
        () => database.households.database.doc(household.id).set(household),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.map((household) => household.id),
    TE.chainFirst((id) => storeSelectedHouseholdIdToStorage(id)),
    TE.chain(createProfileHouseholdRelation(profileId)),
    TE.chain(fetchHousehold),
  );

export const createHouseholdForCurrentProfile = (
  household: Partial<
    Omit<HouseholdModel, "id" | "dateCreated">
  > = defaultHousehold,
): TE.TaskEither<IErr, HouseholdModel> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(createHouseholdForProfile(household)),
  );

export const fetchHousehold = (
  id: string,
): TE.TaskEither<IErr, HouseholdModel> =>
  TE.tryCatch(
    async () => {
      const response = await database.households.database.doc(id).get();
      if (!response.exists) {
        throw new Error();
      }
      return (response.data() as unknown) as HouseholdModel;
    },
    () => "NOT_FOUND",
  );

/**
 * Creates the relationship between a profile and a household.
 *
 * Returns the household ID
 */
export const createProfileHouseholdRelation = (profileId: string) => (
  householdId: string,
): TE.TaskEither<IErr, string> =>
  pipe(
    TE.right(householdId),
    TE.chain(addProfileToHousehold(profileId)),
    TE.chain(addHouseholdToCurrentProfile),
    TE.map(() => householdId),
  );

/**
 * Adds the provided profileId to the provided household (by householdId).
 * Returns the householdId.
 */
const addProfileToHousehold = (profileId: string) => (
  householdId: string,
): TE.TaskEither<IErr, string> =>
  TE.tryCatch(
    async () => {
      await database.households.database.doc(householdId).update({
        profileIds: firebase.firestore.FieldValue.arrayUnion(profileId),
      });
      return householdId;
    },
    () => "BAD_REQUEST",
  );

export const removeProfileFromHousehold = (profileId: string) => (
  householdId: string,
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    () =>
      database.households.database.doc(householdId).update({
        profileIds: firebase.firestore.FieldValue.arrayRemove(profileId),
      }),
    () => "BAD_REQUEST",
  );

/**
 * Removes a household.
 */
export const removeHousehold = (id: string): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => await database.households.database.doc(id).delete(),
    () => "BAD_REQUEST",
  );

export const shareHouseholdInvitation = (
  householdId: string,
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      const link = makeHouseholdInvitationDeepLink(householdId);
      try {
        const result = await Share.share({
          title: `Can you help me care for my plants?`,
          message: `Hey, I need some help caring for my plants! It's easy to sign up, just tap this link to get started: ${link} `,
        });

        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // shared with activity type of result.activityType
          } else {
            // shared
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (error) {
        // TODO: handle
      }
    },
    () => "BAD_REQUEST",
  );

/**
 * Stores and returns the provided household id to AsyncStorage, only if there
 * isn't one already stored.
 * Returns the value stored in AsyncStorage once completed.
 */
export const storeSelectedHouseholdIdToStorageIfNotPresent = (
  id: string,
): TE.TaskEither<IErr, string> => {
  return pipe(
    retrieveSelectedHouseholdIdFromStorage(),
    TE.orElse(() => storeSelectedHouseholdIdToStorage(id)),
  );
};

/**
 * Stores the given household as a preference in async storage, used to select
 * a default household from the list should the user belong to more than one.
 *
 * Returns the household Id
 */
export const storeSelectedHouseholdIdToStorage = (
  id: string,
): TE.TaskEither<IErr, string> =>
  TE.tryCatch(
    async () => {
      setSelectedHouseholdId(id);
      await AsyncStorage.setItem(SELECTED_HOUSEHOLD_ID_KEY, id);
      return id;
    },
    () => "BAD_REQUEST",
  );

/**
 * Retrieves the selected household preference from async storage
 */
export const retrieveSelectedHouseholdIdFromStorage = (): TE.TaskEither<
  IErr,
  string
> =>
  TE.tryCatch(
    async () => {
      const id = await AsyncStorage.getItem(SELECTED_HOUSEHOLD_ID_KEY);
      if (!id) {
        throw new Error();
      }
      return id;
    },
    () => "BAD_REQUEST",
  );

/**
 * Used as a key inside AsyncStorage to persist the user's selected household
 * between logins.
 */
export const SELECTED_HOUSEHOLD_ID_KEY = "SELECTED_HOUSEHOLD_ID";

export const defaultHousehold: Omit<HouseholdModel, "id" | "dateCreated"> = {
  name: "My Urban Jungle",
  profileIds: [],
};
