import stately from "@josephluck/stately";
import { HouseholdModel, PlantModel } from "../../../types";
import { normalizeArrayById } from "../../../utils/normalize";
import makeUseStately from "@josephluck/stately/lib/hooks";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { storeSelectedHouseholdIdToStorage } from "./effects";

interface HouseholdsState {
  selectedHouseholdId: O.Option<string>;
  households: Record<string, HouseholdModel>;
}

const store = stately<HouseholdsState>({
  selectedHouseholdId: O.none,
  households: {}
});

export const selectHouseholds = store.createSelector(s =>
  Object.values(s.households)
);

export const selectSelectedHouseholdId = store.createSelector(
  s => s.selectedHouseholdId
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
 * Gets the user's selected preferred household
 */
export const selectSelectedHousehold = (): O.Option<HouseholdModel> =>
  pipe(selectSelectedHouseholdId(), O.map(selectHouseholdById), O.flatten);

/**
 * Returns the most recently added household from the list of households.
 */
export const selectMostRecentlyAddedHousehold = (): O.Option<HouseholdModel> =>
  pipe(
    selectHouseholds(),
    O.fromPredicate(households => households.length > 0),
    O.map(households =>
      households.sort(
        (a, b) =>
          a.dateCreated.toDate().getTime() - b.dateCreated.toDate().getTime()
      )
    ),
    O.map(households => O.fromNullable(households[0])),
    O.flatten
  );

export const selectMostRecentlyAddedHouseholdId = (): O.Option<string> =>
  pipe(
    selectMostRecentlyAddedHousehold(),
    O.map(household => household.id)
  );

/**
 * Returns a list of unique profileIds for all households in the state.
 */
export const selectProfileIdsForHouseholds = (): string[] => {
  const profileIds = selectHouseholds()
    .map(household => household.profileIds)
    .reduce((acc, arr) => [...acc, ...arr], []);
  return [...new Set(profileIds)];
};

/**
 * Returns the user's selected household. If there isn't one set yet, return the
 * most recently created household (if there are some households in the state).
 * NOTE: this has the side-effect of storing the most recent householdId to
 * AsyncStorage if there isn't one in the state already.
 */
export const getOrSetSelectedHousehold = (): O.Option<HouseholdModel> =>
  pipe(
    selectSelectedHousehold(),
    O.fold(
      () => {
        const household_ = selectMostRecentlyAddedHousehold();
        pipe(
          household_,
          O.map(household => household.id),
          O.map(id => {
            setSelectedHouseholdId(id);
            // NB: This is a dangerous side-effect!
            storeSelectedHouseholdIdToStorage(id);
          })
        );
        return household_;
      },
      household => O.fromNullable(household)
    )
  );

export const setHouseholds = store.createMutator(
  (s, households: HouseholdModel[]) => {
    s.households = { ...s.households, ...normalizeArrayById(households) };
  }
);

export const setSelectedHouseholdId = store.createMutator((s, id: string) => {
  s.selectedHouseholdId = O.fromNullable(id);
});

export const upsertHousehold = store.createMutator(
  (s, household: HouseholdModel) => {
    s.households[household.id] = household;
  }
);

export const deleteHousehold = store.createMutator((s, householdId: string) => {
  delete s.households[householdId];
});

export const useHouseholdsStore = makeUseStately(store);
