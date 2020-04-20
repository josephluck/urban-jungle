import { TodoModel } from "../../../types";
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
 * Finds out whether a todo is overdue
 */
export const selectTodoNextDue = (householdId: string) => (
  todo: TodoModel
): moment.Moment => {
  const _lastCare = selectMostRecentCareForTodo(householdId)(todo.id);
  const nextDueDate = pipe(
    _lastCare,
    O.map((lastCare) =>
      moment(lastCare.dateCreated.toDate()).add(todo.recurrenceDays, "days")
    ),
    O.getOrElse(() => moment())
  );
  return nextDueDate;
};

/**
 * Finds out whether a todo is overdue
 */
export const isTodoOverdue = (householdId: string) => (
  todo: TodoModel
): boolean => {
  const currentDate = moment();
  const currentMonth = currentDate.month();
  if (!todo.activeInMonths.includes(currentMonth)) {
    return false;
  }
  const nextDueDate = selectTodoNextDue(householdId)(todo);
  return nextDueDate.isBefore(currentDate);
};

export const buildTodoSchedule = (householdId: string) => (
  numberOfDays: number
) => {
  const currentDate = moment();
  const todos = selectTodosByHouseholdId(householdId);
  const todosWithDueDates = todos.map((todo) => {
    const nextDue = isTodoOverdue(householdId)(todo)
      ? moment()
      : selectTodoNextDue(householdId)(todo);
    return {
      ...todo,
      dueDates: Array.from({ length: numberOfDays }).map((_, i) =>
        nextDue.clone().add(todo.recurrenceDays * i, "days")
      ),
    };
  });
  return Array.from({ length: numberOfDays }).map((_, i) => {
    const date = currentDate.clone().add(i, "days");
    return {
      date,
      todos: todosWithDueDates
        .filter((todo) => {
          return todo.dueDates.some((dueDate) => dueDate.isSame(date));
        })
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
