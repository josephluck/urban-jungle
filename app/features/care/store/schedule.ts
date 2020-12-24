import * as O from "fp-ts/lib/Option";
import { Moment } from "moment";

import { CareModel } from "@urban-jungle/shared/models/care";
import { PlantModel } from "@urban-jungle/shared/models/plant";
import { TodoModel } from "@urban-jungle/shared/models/todo";

import { selectTodosSchedule } from "../../todos/store/state";
import { selectCareHistory } from "./state";

type TodoWithPlant = TodoModel & {
  plant: O.Option<PlantModel>;
};

export type ScheduleItem = {
  index: number;
  date: Moment;
  todos: TodoWithPlant[];
  cares: CareModel[];
};

export const selectSchedule = (
  householdId: string,
  numberOfDaysEitherSide: number,
): ScheduleItem[] => {
  const allCares = selectCareHistory(householdId)(
    numberOfDaysEitherSide + 1, // NB: +1 to include today
  ).map((item) => ({
    ...item,
    todos: [] as TodoWithPlant[],
  }));
  const allTodos = selectTodosSchedule(householdId)(
    numberOfDaysEitherSide + 1, // NB: +1 to include today
  ).map((item) => ({
    ...item,
    cares: [] as CareModel[],
  }));
  const [todaysCares, ...previousCares] = allCares;
  const [todaysTodos, ...futureTodos] = allTodos;
  return [
    ...previousCares.reverse(),
    { ...todaysTodos, cares: todaysCares.cares },
    ...futureTodos,
  ].map((item, index) => ({ ...item, index }));
};
