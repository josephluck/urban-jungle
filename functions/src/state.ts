import { CareModel } from "@urban-jungle/shared/models/care";
import { TodoModel } from "@urban-jungle/shared/models/todo";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import moment from "moment";

export const getTodosDueToday = (
  householdId: string,
  todos: TodoModel[],
  cares: CareModel[]
) =>
  todos
    .map((todo) => {
      const nextDue = selectTodoNextDue(householdId, cares)(todo);
      return {
        ...todo,
        nextDue,
      };
    })
    .filter((todo) => moment(todo.nextDue).isSame(moment(), "day"));

/**
 * Returns the date that the todo is due for. If it's overdue,
 * it'll return today. If it's never been done, it'll also return today.
 */
export const selectTodoNextDue = (householdId: string, cares: CareModel[]) => (
  todo: TodoModel
): moment.Moment =>
  pipe(
    selectMostRecentCareForTodo(householdId, cares)(todo.id),
    O.map((lastCare) =>
      moment(lastCare.dateCreated.toDate()).add(
        todo.recurrenceCount,
        todo.recurrenceInterval
      )
    ),
    O.filter((nextCare) => nextCare.isSameOrAfter(moment(), "day")),
    O.getOrElse(() => moment())
  );

export const selectMostRecentCareForTodo = (
  householdId: string,
  cares: CareModel[]
) => (todoId: string): O.Option<CareModel> =>
  O.fromNullable(
    sortCaresByMostRecent(
      cares.filter(
        (care) => care.householdId === householdId && care.todoId === todoId
      )
    )[0]
  );

export const sortCaresByMostRecent = (cares: CareModel[]): CareModel[] =>
  cares.sort((a, b) => b.dateCreated.toMillis() - a.dateCreated.toMillis());
