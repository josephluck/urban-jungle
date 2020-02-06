import uuid from "uuid";
import firebase from "firebase";
import { selectCurrentProfileId } from "../../auth/store/state";
import { IErr } from "../../../utils/err";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Household } from "../../../types";
import { database } from "./database";
import { addHouseholdToCurrentProfile } from "../../auth/store/effects";

export const defaultHousehold: Omit<Household, "id"> = {
  name: "Joseph's Home",
  plants: {},
  profileIds: []
};

/**
 * Creates a new household. Subsequently adds the current user relation to it.
 */
export const createHouseholdForProfile = (
  household: Partial<Omit<Household, "id">> = defaultHousehold
) => (profileId: string): TE.TaskEither<IErr, Household> =>
  pipe(
    TE.tryCatch(
      async () => {
        const id = uuid();
        await database()
          .doc(id)
          .set({
            ...defaultHousehold,
            ...household,
            id
          });
        return id;
      },
      () => "BAD_REQUEST" as IErr
    ),
    TE.chain(createProfileHouseholdRelation(profileId)),
    TE.chain(fetchHousehold)
  );

export const createHouseholdForCurrentProfile = (
  household: Partial<Omit<Household, "id">> = defaultHousehold
): TE.TaskEither<IErr, Household> =>
  pipe(
    selectCurrentProfileId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(createHouseholdForProfile(household))
  );

export const fetchHousehold = (id: string): TE.TaskEither<IErr, Household> =>
  TE.tryCatch(
    async () => {
      const response = await database()
        .doc(id)
        .get();
      if (!response.exists) {
        throw new Error();
      }
      return (response.data() as unknown) as Household;
    },
    () => "NOT_FOUND" as IErr
  );

const createProfileHouseholdRelation = (profileId: string) => (
  householdId: string
): TE.TaskEither<IErr, string> =>
  pipe(
    TE.right(householdId),
    TE.chain(addProfileToHousehold(profileId)),
    TE.chain(addHouseholdToCurrentProfile),
    TE.map(() => householdId)
  );

/**
 * Creates the relationship between the current user and a household they have
 * created.
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
