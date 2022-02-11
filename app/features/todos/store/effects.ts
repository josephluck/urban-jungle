import { makeTodoModel, TodoModel } from "@urban-jungle/shared/models/todo";
import { IErr } from "@urban-jungle/shared/utils/err";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { database } from "../../../database";
import { selectHouseholdById } from "../../households/store/state";
import {
  selectTodoByHouseholdId,
  selectTodosByHouseholdIdAndPlantId,
} from "./state";

export const upsertTodoForPlant = (plantId: string, todoId?: string) => (
  householdId: string,
) => (fields: Partial<TodoModel> = {}): TE.TaskEither<IErr, TodoModel> =>
  pipe(
    selectHouseholdById(householdId),
    O.chain(() =>
      todoId
        ? selectTodoByHouseholdId(householdId, todoId)
        : O.fromNullable(makeTodoModel()),
    ),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.map((todo) => ({ ...todo, ...fields, plantId, householdId })),
    TE.chainFirst((todo) =>
      TE.tryCatch(
        () =>
          database.todos
            .database(householdId)
            .doc(todo.id)
            .set({
              ...todo,
              activeInMonths: [...todo.activeInMonths].sort((a, b) => a - b),
            }),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

export const deleteTodosByPlant = (plantId: string) => (
  householdId: string,
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      const todos = selectTodosByHouseholdIdAndPlantId(householdId, plantId);
      const batch = firebase.firestore().batch();
      todos.forEach((todo) =>
        batch.delete(database.todos.database(householdId).doc(todo.id)),
      );
      await batch.commit();
    },
    () => "BAD_REQUEST" as IErr,
  );

export const deleteTodo = (todoId: string) => (
  householdId: string,
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      await database.todos.database(householdId).doc(todoId).delete();
    },
    () => "BAD_REQUEST" as IErr,
  );

export const updateTodoLastDone = (householdId: string, profileId: string) => (
  todoId: string,
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    () =>
      database.todos
        .database(householdId)
        .doc(todoId)
        .update({
          lastDoneBy: profileId,
          dateLastDone: firebase.firestore.Timestamp.fromDate(new Date()),
        } as Partial<TodoModel>),
    () => "BAD_REQUEST" as IErr,
  );

export const updateTodosLastDone = (householdId: string) => (
  profileId: string,
) => (todos: TodoModel[]) =>
  TE.tryCatch(
    async () => {
      const batch = firebase.firestore().batch();
      todos.forEach(({ id }) =>
        batch.update(database.todos.database(householdId).doc(id), {
          lastDoneBy: profileId,
          dateLastDone: firebase.firestore.Timestamp.fromDate(new Date()),
        } as Partial<TodoModel>),
      );
      await batch.commit();
    },
    () => "BAD_REQUEST" as IErr,
  );
