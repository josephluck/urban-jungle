import { HouseholdModel } from "@urban-jungle/shared/models/household";
import { normalizeArrayById } from "@urban-jungle/shared/utils/normalize";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { store } from "../../../store/state";
import {
  MiniProfile,
  selectMiniProfileById,
  selectProfileAvatarById,
  selectProfileNameById,
} from "../../profiles/store/state";

export const selectHouseholds = store.createSelector((s) =>
  Object.values(s.households.households)
);

export const selectSelectedHouseholdId = store.createSelector(
  (s) => s.households.selectedHouseholdId
);

export const selectHouseholdById = (id: string): O.Option<HouseholdModel> =>
  O.fromNullable(selectHouseholds().find((household) => household.id === id));

export const selectedSelectedOrMostRecentHouseholdId = (): O.Option<string> =>
  pipe(
    selectSelectedHouseholdId(),
    O.fold(selectMostRecentlyAddedHouseholdId, O.some)
  );

/**
 * Gets the user's selected preferred household, or the most recent one if there
 * isn't a preference.
 */
export const selectSelectedHousehold = (): O.Option<HouseholdModel> =>
  pipe(selectedSelectedOrMostRecentHouseholdId(), O.chain(selectHouseholdById));

export const selectSelectedHouseholdName = (): O.Option<string> =>
  pipe(
    selectSelectedHousehold(),
    O.map((household) => household.name)
  );

/**
 * Returns the most recently added household from the list of households.
 */
export const selectMostRecentlyAddedHousehold = (): O.Option<HouseholdModel> =>
  pipe(
    selectHouseholds(),
    O.fromPredicate((households) => households.length > 0),
    O.map((households) =>
      households.sort(
        (a, b) =>
          a.dateCreated.toDate().getTime() - b.dateCreated.toDate().getTime()
      )
    ),
    O.map((households) => O.fromNullable(households[0])),
    O.flatten
  );

export const selectMostRecentlyAddedHouseholdId = (): O.Option<string> =>
  pipe(
    selectMostRecentlyAddedHousehold(),
    O.map((household) => household.id)
  );

/**
 * Returns a list of unique profileIds for all households in the state.
 */
export const selectProfileIdsForHouseholds = (): string[] => {
  const profileIds = selectHouseholds()
    .map((household) => household.profileIds)
    .reduce((acc, arr) => [...acc, ...arr], []);
  return [...new Set(profileIds)];
};

export const selectProfileIdsForHousehold = (id: string): O.Option<string[]> =>
  pipe(
    selectHouseholdById(id),
    O.map((household) => household.profileIds)
  );

export const selectProfileAvatarsForHousehold = (
  id: string
): O.Option<string>[] =>
  pipe(
    selectProfileIdsForHousehold(id),
    O.map((profileIds) => profileIds.map(selectProfileAvatarById)),
    O.fold(
      () => [],
      (val) => val
    )
  );

export const selectProfileNamesForHousehold = (
  id: string
): O.Option<string>[] =>
  pipe(
    selectProfileIdsForHousehold(id),
    O.map((profileIds) => profileIds.map(selectProfileNameById)),
    O.fold(
      () => [],
      (val) => val
    )
  );

export const selectProfilesForHousehold = (id: string): MiniProfile[] =>
  pipe(
    selectProfileIdsForHousehold(id),
    O.getOrElse(() => [] as string[])
  ).map(selectMiniProfileById);

export const setHouseholds = store.createMutator(
  (s, households: HouseholdModel[]) => {
    s.households.households = {
      ...s.households.households,
      ...normalizeArrayById(households),
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
