import { CareModel } from "@urban-jungle/shared/models/care";
import { makeTodoModel, TodoModel } from "@urban-jungle/shared/models/todo";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { database } from "../../../database";
import { selectHouseholdById } from "../../households/store/state";
import {
  selectTodoByHouseholdId,
  selectTodosByHouseholdIdAndPlantId,
} from "./state";
import firestore from "@react-native-firebase/firestore";

export const upsertTodoForPlant = (plantId: string, todoId?: string) => (
  householdId: string
) => (fields: Partial<TodoModel> = {}): TE.TaskEither<IErr, TodoModel> =>
  pipe(
    selectHouseholdById(householdId),
    O.chain(() =>
      todoId
        ? selectTodoByHouseholdId(householdId, todoId)
        : O.fromNullable(makeTodoModel())
    ),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.chain((todo) =>
      TE.tryCatch(
        async () => {
          const todoToSave = {
            ...todo,
            ...fields,
            plantId,
            householdId,
          };
          await database.todos
            .database(householdId)
            .doc(todoToSave.id)
            .set({
              ...todoToSave,
              activeInMonths: [...todoToSave.activeInMonths].sort(
                (a, b) => a - b
              ),
            });
          return todoToSave;
        },
        () => "BAD_REQUEST" as IErr
      )
    )
  );

export const deleteTodosByPlant = (plantId: string) => (
  householdId: string
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      const todos = selectTodosByHouseholdIdAndPlantId(householdId, plantId);
      const batch = firestore().batch();
      todos.forEach((todo) =>
        batch.delete(database.todos.database(householdId).doc(todo.id))
      );
      await batch.commit();
    },
    () => "BAD_REQUEST" as IErr
  );

export const deleteTodo = (todoId: string) => (
  householdId: string
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      await database.todos.database(householdId).doc(todoId).delete();
    },
    () => "BAD_REQUEST" as IErr
  );

export const updateTodoLastDone = (
  householdId: string,
  profileId: string,
  care: CareModel
) => (todoId: string): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      await database.todos
        .database(householdId)
        .doc(todoId)
        .update({
          lastDoneBy: profileId,
          dateLastDone: care.dateCreated,
        } as Partial<TodoModel>);
    },
    () => "BAD_REQUEST" as IErr
  );
