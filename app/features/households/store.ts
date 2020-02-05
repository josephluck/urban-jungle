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
  removeHouseholdFromProfile,
  fetchProfiles,
  selectCurrentProfileId
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

/**
 * Subscribes to households and recursively fetches associated profiles.
 * NB: the profiles are fetched and stored in the auth store, and the auth store
 * is responsible for subscribing to the profiles in it's own store.
 * It might be better to extract these subscriptions to a custom React hook that
 * can deal with cleaning up the subscriptions correctly.
 */
export const subscribeToHouseholds = store.createEffect(
  async (state, profileId: string) => {
    state.removeHouseholdsSubscription();
    const subscription = database()
      .where("profileIds", "array-contains", profileId)
      .onSnapshot(async snapshot => {
        const addedOrModified: Household[] = snapshot
          .docChanges()
          .filter(change => ["added", "modified"].includes(change.type))
          .map(change => (change.doc.data() as unknown) as Household);
        const removed: Household[] = snapshot
          .docChanges()
          .filter(change => change.type === "removed")
          .map(change => (change.doc.data() as unknown) as Household);
        const profileIds = addedOrModified
          .map(household => household.profileIds)
          .reduce((prev, arr) => [...prev, ...arr], []);
        const profileFetches = fetchProfiles(profileIds);
        const householdRemovals = removed.map(household => {
          deleteHousehold(household.id);
          return removeHouseholdFromProfile(household.id)();
        });
        await Promise.all([profileFetches, householdRemovals]);
      });
    setRemoveHouseholdsSubscription(subscription);
  }
);

/**
 * Creates a new household. Subsequently adds the current user relation to it.
 */
export const createHousehold = (
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
    TE.chain(createHousehold(household))
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
