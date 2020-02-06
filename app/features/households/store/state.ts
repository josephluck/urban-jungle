import stately from "@josephluck/stately";
import { Household } from "../../../types";
import { normalizeArrayById } from "../../../utils/normalize";
import makeUseStately from "@josephluck/stately/lib/hooks";
import {
  removeHouseholdFromProfile,
  fetchProfiles
} from "../../auth/store/effects";
import { database } from "./database";

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

export const useHouseholdsStore = makeUseStately(store);
