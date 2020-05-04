import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import moment from "moment";
import { sequenceO } from "../../../fp/option";
import { PlantModel } from "../../../models/plant";
import { TodoModel } from "../../../models/todo";
import { normalizedStateFactory } from "../../../store/factory";
import { selectMostRecentCareForTodo } from "../../care/store/state";
import { selectPlantByHouseholdId } from "../../plants/store/state";

const methods = normalizedStateFactory<TodoModel>("todos");

export const selectNormalizedTodosByHouseholdId = methods.selectNormalized;
export const selectTodosByHouseholdId = methods.selectMany;
export const selectTodoByHouseholdId = methods.select;
export const selectTodosByIds = methods.selectManyByIds;

export const upsertTodo = methods.upsert;
export const upsertTodos = methods.upsertMany;
export const removeTodo = methods.remove;
export const removeTodos = methods.removeMany;

export const selectTodosByHouseholdIdAndPlantId = (
  householdId: string,
  plantId: string
): TodoModel[] =>
  selectTodosByHouseholdId(householdId).filter(
    (todo) => todo.plantId === plantId
  );

/**
 * Returns the date that the todo is due for. If it's overdue,
 * it'll return today. If it's never been done, it'll also return today.
 */
export const selectTodoNextDue = (householdId: string) => (
  todo: TodoModel
): moment.Moment =>
  pipe(
    selectMostRecentCareForTodo(householdId)(todo.id),
    O.map((lastCare) =>
      moment(lastCare.dateCreated.toDate()).add(todo.recurrenceDays, "days")
    ),
    O.filter((nextCare) => nextCare.isSameOrAfter(moment(), "day")),
    O.getOrElse(() => moment())
  );

export const selectTodosSchedule = (householdId: string) => (
  numberOfDays: number
) => {
  const currentDate = moment();
  const todos = selectTodosByHouseholdId(householdId);
  const todosWithDueDates = todos.map((todo) => {
    const nextDue = selectTodoNextDue(householdId)(todo);
    return {
      ...todo,
      dueDates: Array.from({ length: numberOfDays }).map((_, i) =>
        i === 0 ? nextDue : nextDue.clone().add(todo.recurrenceDays * i, "days")
      ),
    };
  });
  return Array.from({ length: numberOfDays }).map((_, i) => {
    const date = i === 0 ? currentDate : currentDate.clone().add(i, "days");
    return {
      date,
      todos: todosWithDueDates
        .filter((todo) =>
          todo.dueDates.some((dueDate) => dueDate.isSame(date, "day"))
        )
        .map(({ dueDates, ...todo }) => ({
          ...todo,
          plant: selectPlantByHouseholdId(householdId, todo.plantId),
        })),
    };
  });
};

export const selectTodosForPlant = (plantId: string) => (
  householdId: string
): TodoModel[] =>
  selectTodosByHouseholdId(householdId).filter(
    (todo) => todo.plantId === plantId
  );

export type TodoWithPlantModel = TodoModel & {
  plant: O.Option<PlantModel>;
};

export const selectTodosAndPlantsByIds = (householdId: string) => (
  todoIds: string[]
): TodoWithPlantModel[] =>
  selectTodosByIds(householdId, todoIds)
    .map((todo) => ({
      ...todo,
      plant: selectPlantByHouseholdId(householdId, todo.plantId),
    }))
    .filter((todo) => O.isSome(todo.plant));

export const sortTodosByLocationAndPlant = (
  { title: titleA, plant: plantA }: TodoWithPlantModel,
  { title: titleB, plant: plantB }: TodoWithPlantModel
): number =>
  pipe(
    sequenceO(plantA, plantB),
    O.fold(
      () => -1,
      ([
        { id: idA, name: nameA, location: locationA = "" },
        { id: idB, name: nameB, location: locationB = "" },
      ]) =>
        locationA.localeCompare(locationB) ||
        nameA.localeCompare(nameB) ||
        idA.localeCompare(idB) ||
        titleA.localeCompare(titleB)
    )
  );
