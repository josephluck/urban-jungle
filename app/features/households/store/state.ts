import stately from "@josephluck/stately";
import { Household } from "../../../types";
import { normalizeArrayById } from "../../../utils/normalize";
import makeUseStately from "@josephluck/stately/lib/hooks";

interface HouseholdsState {
  households: Record<string, Household>;
}

const store = stately<HouseholdsState>({
  households: {}
});

export const selectHouseholds = store.createSelector(s =>
  Object.values(s.households)
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

export const useHouseholdsStore = makeUseStately(store);
