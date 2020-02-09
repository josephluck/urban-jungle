import { HouseholdModel } from "../../../types";
import { normalizeArrayById } from "../../../utils/normalize";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import {
  selectProfileAvatarById,
  selectProfileNameById
} from "../../profiles/store/state";
import { store } from "../../../store/state";
import { getFirstLetterFromOptionString } from "../../../fp/option";

export const selectHouseholds = store.createSelector(s =>
  Object.values(s.households.households)
);

export const selectSelectedHouseholdId = store.createSelector(
  s => s.households.selectedHouseholdId
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

export const selectProfileNamesForHousehold = (
  id: string
): O.Option<string>[] =>
  pipe(
    selectProfileIdsForHousehold(id),
    O.map(profileIds => profileIds.map(selectProfileNameById)),
    O.fold(
      () => [],
      val => val
    )
  );

interface HouseholdProfile {
  id: string;
  name: O.Option<string>;
  letter: O.Option<string>;
  avatar: O.Option<string>;
}

export const selectProfilesForHousehold = (id: string): HouseholdProfile[] => {
  const ids = selectProfileIdsForHousehold(id);
  return pipe(
    ids,
    O.getOrElse(() => [] as string[])
  ).map(id => {
    const name = selectProfileNameById(id);
    return {
      id,
      name,
      letter: pipe(name, O.map(getFirstLetterFromOptionString), O.flatten),
      avatar: selectProfileAvatarById(id)
    };
  });
};

export const setHouseholds = store.createMutator(
  (s, households: HouseholdModel[]) => {
    s.households.households = {
      ...s.households.households,
      ...normalizeArrayById(households)
    };
  }
);

export const setSelectedHouseholdId = store.createMutator((s, id: string) => {
  s.households.selectedHouseholdId = O.fromNullable(id);
});

export const upsertHousehold = store.createMutator(
  (s, household: HouseholdModel) => {
    s.households.households[household.id] = household;
  }
);

export const deleteHousehold = store.createMutator((s, householdId: string) => {
  delete s.households.households[householdId];
});
