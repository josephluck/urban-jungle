import uuid from "uuid";
import firebase from "firebase";
import stately from "@josephluck/stately";
import { Household } from "../../types";
import { IErr } from "../../utils/err";
import * as TE from "fp-ts/lib/TaskEither";
import { normalizeArrayById } from "../../utils/normalize";
import makeUseStately from "@josephluck/stately/lib/hooks";
import {
  addHouseholdToCurrentProfile,
  removeHouseholdFromProfile
} from "../auth/store";
import { pipe } from "fp-ts/lib/pipeable";

const database = () => firebase.firestore().collection("households");

interface HouseholdsState {
  households: Record<string, Household>;
  removeHouseholdsSubscription: () => void;
}

const store = stately<HouseholdsState>({
  households: {},
  removeHouseholdsSubscription: () => null
});

export const selectHouseholds = store.createSelector(s =>
  Object.values(s.households)
);

export const setRemoveHouseholdsSubscription = store.createMutator(
  (s, subscription) => {
    s.removeHouseholdsSubscription = subscription;
  }
);

export const setHouseholds = store.createMutator(
  (s, households: Household[]) => {
    s.households = { ...s.households, ...normalizeArrayById(households) };
  }
);

export const upsertHousehold = store.createMutator(
  (s, household: Household) => {
    s.households[household.id] = household;
  }
);

export const deleteHousehold = store.createMutator((s, householdId: string) => {
  delete s.households[householdId];
});

export const subscribeToHouseholds = store.createEffect(
  async (state, profileId: string) => {
    state.removeHouseholdsSubscription();
    const subscription = database()
      .where("profileIds", "array-contains", profileId)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === "added" || change.type === "modified") {
            upsertHousehold((change.doc.data() as unknown) as Household);
          } else if (change.type === "removed") {
            /**
             * TODO: should probably only delete the household if the profile
             * is the only profile associated with the household, to prevent
             * the deletion of a household affecting other members.
             */
            deleteHousehold(change.doc.id);
            removeHouseholdFromProfile(change.doc.id)();
          }
        });
      });
    setRemoveHouseholdsSubscription(subscription);
  }
);

/**
 * Creates a new household. Subsequently adds the current user relation to it.
 */
export const createHousehold = (
  profileId: string,
  household: Omit<Household, "id"> = defaultHousehold
): TE.TaskEither<IErr, Household> =>
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

export const defaultHousehold: Omit<Household, "id"> = {
  name: "Joseph's Home",
  plants: {},
  profileIds: []
};

export const useHouseholdsStore = makeUseStately(store);
