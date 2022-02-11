import { sequenceTO } from "@urban-jungle/shared/fp/option";
import { PlantModel } from "@urban-jungle/shared/models/plant";
import { TodoModel } from "@urban-jungle/shared/models/todo";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import moment from "moment";
import { normalizedStateFactory } from "../../../store/factory";
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
  plantId: string,
): TodoModel[] =>
  selectTodosByHouseholdId(householdId).filter(
    (todo) => todo.plantId === plantId,
  );

/**
 * Returns the date that the todo is due for. If it's overdue,
 * it'll return today. If it's never been done, it'll also return today.
 * TODO: no need for the wrapping fn
 */
export const selectTodoNextDue = (todo: TodoModel): moment.Moment =>
  pipe(
    O.fromNullable(todo.dateLastDone),
    O.map((lastDone) =>
      moment(lastDone.toDate()).add(
        todo.recurrenceCount,
        todo.recurrenceInterval,
      ),
    ),
    O.filter((dueDate) => dueDate.isSameOrAfter(moment(), "day")),
    O.getOrElse(() => moment()),
  );

export const selectDueTodos = (householdId: string) => () =>
  selectTodosByHouseholdId(householdId)
    .map((todo) => ({
      ...todo,
      nextDue: selectTodoNextDue(todo),
    }))
    .filter((todo) => moment(todo.nextDue).isSame(moment(), "date"))
    .map((todo) => todo.id);

export const selectTodosForPlant = (plantId: string) => (
  householdId: string,
): TodoModel[] =>
  selectTodosByHouseholdId(householdId).filter(
    (todo) => todo.plantId === plantId,
  );

export type TodoWithPlantModel = TodoModel & {
  plant: O.Option<PlantModel>;
};

export const selectTodosAndPlantsByIds = (householdId: string) => (
  todoIds: string[],
): TodoWithPlantModel[] =>
  selectTodosByIds(householdId, todoIds)
    .map((todo) => ({
      ...todo,
      plant: selectPlantByHouseholdId(householdId, todo.plantId),
    }))
    .filter((todo) => O.isSome(todo.plant));

export const sortTodosByLocationAndPlant = (
  { plant: plantA }: TodoWithPlantModel,
  { plant: plantB }: TodoWithPlantModel,
): number =>
  pipe(
    sequenceTO(plantA, plantB),
    O.fold(
      () => -1,
      ([
        { id: idA, name: nameA, location: locationA = "" },
        { id: idB, name: nameB, location: locationB = "" },
      ]) =>
        locationA.localeCompare(locationB) ||
        nameA.localeCompare(nameB) ||
        idA.localeCompare(idB),
    ),
  );

export type TodosGroup = {
  data: TodoWithPlantModel[];
  title: string;
};

// TODO: this could be a reduce...
export const groupTodosByType = () => {
  const groups: TodosGroup[] = [];
  return (todos: TodoWithPlantModel[]) => {
    todos.forEach((todo) => {
      const existingGroup = groups.find((group) => group.title === todo.title);
      if (existingGroup) {
        existingGroup.data.push(todo);
      } else {
        groups.push({
          title: todo.title,
          data: [todo],
        });
      }
    });

    return groups
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((group) => ({
        ...group,
        data: group.data.sort(sortTodosByLocationAndPlant),
      }));
  };
};

export const selectUniqueTodoTitles = (householdId: string): string[] => [
  ...new Set(
    selectTodosByHouseholdId(householdId)
      .map((todo) => todo.title)
      .filter(Boolean) as string[],
  ),
];
