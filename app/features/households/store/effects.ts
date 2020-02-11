import uuid from "uuid";
import firebase from "firebase";
import { selectCurrentUserId } from "../../auth/store/state";
import { IErr } from "../../../utils/err";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { HouseholdModel } from "../../../types";
import { database } from "./database";
import { addHouseholdToCurrentProfile } from "../../profiles/store/effects";
import { AsyncStorage, Share } from "react-native";
import { setSelectedHouseholdId } from "./state";
import { makeHouseholdInvitationDeepLink } from "../../../linking/household-invitation";

/**
 * Creates a new household. Subsequently adds the current user relation to it.
 */
export const createHouseholdForProfile = (
  household: Partial<
    Omit<HouseholdModel, "id" | "dateCreated">
  > = defaultHousehold
) => (profileId: string): TE.TaskEither<IErr, HouseholdModel> =>
  pipe(
    TE.tryCatch(
      async () => {
        const id = uuid();
        await database()
          .doc(id)
          .set({
            ...defaultHousehold,
            ...household,
            id,
            dateCreated: firebase.firestore.Timestamp.fromDate(new Date())
          });
        return id;
      },
      () => "BAD_REQUEST" as IErr
    ),
    TE.chainFirst(id => storeSelectedHouseholdIdToStorage(id)),
    TE.chain(createProfileHouseholdRelation(profileId)),
    TE.chain(fetchHousehold)
  );

export const createHouseholdForCurrentProfile = (
  household: Partial<
    Omit<HouseholdModel, "id" | "dateCreated">
  > = defaultHousehold
): TE.TaskEither<IErr, HouseholdModel> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(createHouseholdForProfile(household))
  );

export const fetchHousehold = (
  id: string
): TE.TaskEither<IErr, HouseholdModel> =>
  TE.tryCatch(
    async () => {
      const response = await database()
        .doc(id)
        .get();
      if (!response.exists) {
        throw new Error();
      }
      return (response.data() as unknown) as HouseholdModel;
    },
    () => "NOT_FOUND" as IErr
  );

/**
 * Creates the relationship between a profile and a household.
 *
 * Returns the household ID
 */
export const createProfileHouseholdRelation = (profileId: string) => (
  householdId: string
): TE.TaskEither<IErr, string> =>
  pipe(
    TE.right(householdId),
    TE.chain(addProfileToHousehold(profileId)),
    TE.chain(addHouseholdToCurrentProfile),
    TE.map(() => householdId)
  );

/**
 * Adds the provided profileId to the provided household (by householdId).
 * Returns the householdId.
 */
const addProfileToHousehold = (profileId: string) => (
  householdId: string
): TE.TaskEither<IErr, string> =>
  TE.tryCatch(
    async () => {
      await database()
        .doc(householdId)
        .update({
          profileIds: firebase.firestore.FieldValue.arrayUnion(profileId)
        });
      return householdId;
    },
    () => "BAD_REQUEST" as IErr
  );

export const removeProfileFromHousehold = (profileId: string) => (
  householdId: string
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      await database()
        .doc(householdId)
        .update({
          profileIds: firebase.firestore.FieldValue.arrayRemove(profileId)
        });
    },
    () => "BAD_REQUEST" as IErr
  );

/**
 * Removes a household.
 */
export const removeHousehold = (id: string): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () =>
      await database()
        .doc(id)
        .delete(),
    () => "BAD_REQUEST" as IErr
  );

export const shareHouseholdInvitation = (
  householdId: string
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      const link = makeHouseholdInvitationDeepLink(householdId);
      try {
        const result = await Share.share({
          title: `Can you help me care for my plants?`,
          message: `Hey, I need some help caring for my plants! It's easy to sign up, just tap this link to get started: ${link} `
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
        alert(error.message);
      }
    },
    () => "BAD_REQUEST" as IErr
  );

/**
 * Stores and returns the provided household id to AsyncStorage, only if there
 * isn't one already stored.
 * Returns the value stored in AsyncStorage once completed.
 */
export const storeSelectedHouseholdIdToStorageIfNotPresent = (
  id: string
): TE.TaskEither<IErr, string> => {
  return pipe(
    retrieveSelectedHouseholdIdFromStorage(),
    TE.orElse(() => storeSelectedHouseholdIdToStorage(id))
  );
};

/**
 * Stores the given household as a preference in async storage, used to select
 * a default household from the list should the user belong to more than one.
 *
 * Returns the household Id
 */
export const storeSelectedHouseholdIdToStorage = (
  id: string
): TE.TaskEither<IErr, string> =>
  TE.tryCatch(
    async () => {
      setSelectedHouseholdId(id);
      await AsyncStorage.setItem(SELECTED_HOUSEHOLD_ID_KEY, id);
      return id;
    },
    () => "BAD_REQUEST" as IErr
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
    () => "BAD_REQUEST" as IErr
  );

/**
 * Used as a key inside AsyncStorage to persist the user's selected household
 * between logins.
 */
export const SELECTED_HOUSEHOLD_ID_KEY = "SELECTED_HOUSEHOLD_ID";

export const defaultHousehold: Omit<HouseholdModel, "id" | "dateCreated"> = {
  name: "My Home",
  profileIds: []
};
