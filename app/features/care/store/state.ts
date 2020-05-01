import { CareModel } from "../../../models/care";
import * as O from "fp-ts/lib/Option";
import moment from "moment";
import { normalizedStateFactory } from "../../../store/factory";

const methods = normalizedStateFactory<CareModel>("cares");

export const selectNormalizedCaresByHouseholdId = methods.selectNormalized;
export const selectCaresByHouseholdId = methods.selectMany;

export const upsertCare = methods.upsert;
export const upsertCares = methods.upsertMany;
export const removeCare = methods.remove;
export const removeCares = methods.removeMany;

export const selectCaresByHouseholdIdAndPlantId = (
  householdId: string,
  plantId: string
): CareModel[] =>
  selectCaresByHouseholdId(householdId).filter(
    (care) => care.plantId === plantId
  );

export const sortCaresByMostRecent = (cares: CareModel[]): CareModel[] =>
  cares.sort((a, b) => b.dateCreated.toMillis() - a.dateCreated.toMillis());

export const selectMostRecentCareByHouseholdIdAndPlantId = (
  householdId: string,
  plantId: string
): O.Option<CareModel> =>
  O.fromNullable(
    sortCaresByMostRecent(
      selectCaresByHouseholdIdAndPlantId(householdId, plantId)
    )[0]
  );

export const selectCaresForTodo = (householdId: string) => (
  todoId: string
): CareModel[] =>
  selectCaresByHouseholdId(householdId).filter(
    (care) => care.todoId === todoId
  );

export const selectCaresForPlant = (householdId: string) => (
  plantId: string
): CareModel[] =>
  selectCaresByHouseholdId(householdId).filter(
    (care) => care.plantId === plantId
  );

export const selectMostRecentCareForTodo = (householdId: string) => (
  todoId: string
): O.Option<CareModel> =>
  O.fromNullable(
    sortCaresByMostRecent(selectCaresForTodo(householdId)(todoId))[0]
  );

export const selectCareHistory = (householdId: string) => (days: number) => {
  const cares = selectCaresByHouseholdId(householdId);
  return Array.from({ length: days }).map((_, index) => {
    const date = index === 0 ? moment() : moment().subtract(index, "days");
    return {
      date,
      cares: cares.filter((care) =>
        moment(care.dateCreated.toDate()).isSame(date, "day")
      ),
    };
  });
};
