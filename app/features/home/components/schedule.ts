import { selectCareHistory } from "../../care/store/state";
import { selectTodosSchedule } from "../../todos/store/state";
import { TodoModel } from "../../../models/todo";
import { CareModel } from "../../../models/care";
import * as O from "fp-ts/lib/Option";
import { PlantModel } from "../../../models/plant";
import { Moment } from "moment";

type TodoWithPlant = TodoModel & {
  plant: O.Option<PlantModel>;
};

type ScheduleItem = {
  date: Moment;
  todos: TodoWithPlant[];
  cares: CareModel[];
};

export const selectSchedule = (
  householdId: string,
  numberOfDaysEitherSide: number
): ScheduleItem[] => {
  // NB: +1 to include today
  const allCares = selectCareHistory(householdId)(
    numberOfDaysEitherSide + 1
  ).map((item) => ({
    ...item,
    todos: [] as TodoWithPlant[],
  }));
  const allTodos = selectTodosSchedule(householdId)(
    numberOfDaysEitherSide + 1
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
  ];
};
