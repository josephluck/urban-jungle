import stately from "@josephluck/stately";
import { HouseholdModel } from "../../../types";
import { normalizeArrayById } from "../../../utils/normalize";
import makeUseStately from "@josephluck/stately/lib/hooks";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { selectProfileAvatarById } from "../../auth/store/state";

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

export const selectHouseholdById = (id: string): O.Option<HouseholdModel> =>
  O.fromNullable(selectHouseholds().find(household => household.id === id));

/**
 * Gets the user's selected preferred household, or the most recent one if there
 * isn't a preference.
 */
export const selectSelectedHousehold = (): O.Option<HouseholdModel> =>
  pipe(
    selectSelectedHouseholdId(),
    O.map(selectHouseholdById),
    O.flatten,
    O.fold(selectMostRecentlyAddedHousehold, O.fromNullable)
  );

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

export const selectProfileIdsForHousehold = (id: string): O.Option<string[]> =>
  pipe(
    selectHouseholdById(id),
    O.map(household => household.profileIds)
  );

export const selectProfileAvatarsForHousehold = (
  id: string
): O.Option<string>[] =>
  pipe(
    selectProfileIdsForHousehold(id),
    O.map(profileIds => profileIds.map(selectProfileAvatarById)),
    O.fold(
      () => [],
      val => val
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
