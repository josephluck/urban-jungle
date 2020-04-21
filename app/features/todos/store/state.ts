import { TodoModel } from "../../../models/todo";
import { normalizeArrayById } from "../../../utils/normalize";
import { store } from "../../../store/state";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import moment from "moment";
import { selectMostRecentCareForTodo } from "../../care/store/state";

export const selectNormalizedTodosByHouseholdId = store.createSelector(
  (s, householdId: string): O.Option<Record<string, TodoModel>> =>
    O.fromNullable(s.todos.todosByHouseholdId[householdId])
);

export const selectTodosByHouseholdId = (householdId: string): TodoModel[] =>
  pipe(
    selectNormalizedTodosByHouseholdId(householdId),
    O.map(Object.values),
    O.getOrElse(() => [] as TodoModel[])
  );

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
    O.filter((nextCare) => nextCare.isSameOrAfter(moment())),
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
        .filter((todo) => todo.dueDates.some((dueDate) => dueDate.isSame(date)))
        .map(({ dueDates, ...todo }) => todo),
    };
  });
};

export const setTodos = store.createMutator(
  (s, householdId: string, todos: TodoModel[]) => {
    s.todos.todosByHouseholdId[householdId] = {
      ...s.todos.todosByHouseholdId[householdId],
      ...normalizeArrayById(todos),
    };
  }
);

export const upsertTodo = store.createMutator(
  (s, householdId: string, todo: TodoModel) => {
    if (!s.todos.todosByHouseholdId[householdId]) {
      s.todos.todosByHouseholdId[householdId] = {};
    }
    s.todos.todosByHouseholdId[householdId][todo.id] = todo;
  }
);

export const deleteTodo = store.createMutator(
  (s, householdId: string, todoId: string) => {
    delete s.todos.todosByHouseholdId[householdId][todoId];
  }
);

export const upsertTodoByHouseholdId = (householdId: string) => (
  todo: TodoModel
) => upsertTodo(householdId, todo);

export const deleteTodobyHouseholdId = (householdId: string) => (
  todoId: string
) => deleteTodo(householdId, todoId);
