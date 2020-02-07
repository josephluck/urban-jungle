import stately from "@josephluck/stately";
import { HouseholdModel, PlantModel } from "../../../types";
import { normalizeArrayById } from "../../../utils/normalize";
import makeUseStately from "@josephluck/stately/lib/hooks";
import * as O from "fp-ts/lib/Option";

interface HouseholdsState {
  households: Record<string, HouseholdModel>;
}

const store = stately<HouseholdsState>({
  households: {}
});

export const selectHouseholds = store.createSelector(s =>
  Object.values(s.households)
);

interface HouseholdAndPlants extends Omit<HouseholdModel, "plants"> {
  plants: PlantModel[];
}

export const selectHouseholdsAndPlants = (): HouseholdAndPlants[] =>
  selectHouseholds().map(household => ({
    ...household,
    plants: Object.values(household.plants)
  }));

export const selectHouseholdById = (id: string): O.Option<HouseholdModel> =>
  O.fromNullable(selectHouseholds().find(household => household.id === id));

/**
 * Returns a list of unique profileIds for all households in the state.
 */
export const selectProfileIdsForHouseholds = (): string[] => {
  const profileIds = selectHouseholds()
    .map(household => household.profileIds)
    .reduce((acc, arr) => [...acc, ...arr], []);
  return [...new Set(profileIds)];
};

export const setHouseholds = store.createMutator(
  (s, households: HouseholdModel[]) => {
    s.households = { ...s.households, ...normalizeArrayById(households) };
  }
);

export const upsertHousehold = store.createMutator(
  (s, household: HouseholdModel) => {
    s.households[household.id] = household;
  }
);

export const deleteHousehold = store.createMutator((s, householdId: string) => {
  delete s.households[householdId];
});

export const useHouseholdsStore = makeUseStately(store);
