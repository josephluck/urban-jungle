import { CareModel } from "../../../types";
import { normalizeArrayById } from "../../../utils/normalize";
import { store } from "../../../store/state";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";

export const selectNormalizedCaresByHouseholdId = store.createSelector(
  (s, householdId: string): O.Option<Record<string, CareModel>> =>
    O.fromNullable(s.cares.caresByHouseholdId[householdId])
);

export const selectCaresByHouseholdId = (householdId: string): CareModel[] =>
  pipe(
    selectNormalizedCaresByHouseholdId(householdId),
    O.map(Object.values),
    O.getOrElse(() => [] as CareModel[])
  );

export const selectCaresByHouseholdIdAndPlantId = (
  householdId: string,
  plantId: string
): CareModel[] =>
  selectCaresByHouseholdId(householdId).filter(
    care => care.plantId === plantId
  );

export const sortCaresByMostRecent = (cares: CareModel[]): CareModel[] =>
  cares.sort((a, b) => a.dateCreated.toMillis() - b.dateCreated.toMillis());

export const selectMostRecentCareByHouseholdIdAndPlantId = (
  householdId: string,
  plantId: string
): O.Option<CareModel> =>
  O.fromNullable(
    sortCaresByMostRecent(
      selectCaresByHouseholdIdAndPlantId(householdId, plantId)
    )[0]
  );

const numberOfMillisInDay = 86400000;

/**
 * Returns the number of days until the next care for a given plant is due.
 *
 * If the plant has been cared for within todays date - careRecurrenceDays, this
 * will return a positive number. I.e. if the todays date is 12/01/20 and the
 * last care was the 10/01/20 and the careRecurrenceDays is 5, this will return
 * 3 (due in 3 days).
 *
 * If the plant is overdue, this will return a negative number. I.e. if the
 * todays date is 12/01/20 and the last care was on 06/01/20 and the
 * careRecurrenceDays is 5, this will return 1 (overdue by 1 day).
 *
 * If there's no cares for the plant, then it assumes the plant needs care today
 * and will return 0 (today).
 *
 */
export const selectNumberOfDaysUntilNextCareByHouseholdIdAndPlantId = (
  householdId: string
) => (plantId: string) => (careRecurrenceDays: number): number =>
  pipe(
    selectMostRecentCareByHouseholdIdAndPlantId(householdId, plantId),
    O.map(care => {
      const todaysDate = new Date();
      const careDate = care.dateCreated.toDate();
      const daysSinceLastCare = Math.ceil(
        (careDate.valueOf() - todaysDate.valueOf()) / numberOfMillisInDay
      );
      return careRecurrenceDays - daysSinceLastCare;
    }),
    O.getOrElse(() => 0)
  );

export const setCares = store.createMutator(
  (s, householdId: string, cares: CareModel[]) => {
    s.cares.caresByHouseholdId[householdId] = {
      ...s.cares.caresByHouseholdId[householdId],
      ...normalizeArrayById(cares)
    };
  }
);

export const upsertCare = store.createMutator(
  (s, householdId: string, care: CareModel) => {
    if (!s.cares.caresByHouseholdId[householdId]) {
      s.cares.caresByHouseholdId[householdId] = {};
    }
    s.cares.caresByHouseholdId[householdId][care.id] = care;
  }
);

export const deleteCare = store.createMutator(
  (s, householdId: string, careId: string) => {
    delete s.cares.caresByHouseholdId[householdId][careId];
  }
);

export const upsertCareByHouseholdId = (householdId: string) => (
  care: CareModel
) => upsertCare(householdId, care);

export const deleteCarebyHouseholdId = (householdId: string) => (
  careId: string
) => deleteCare(householdId, careId);
