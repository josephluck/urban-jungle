import * as TE from "fp-ts/lib/TaskEither";
import { TodoModel, makeTodoModel } from "../../../models/todo";
import { IErr } from "../../../utils/err";
import uuid from "uuid";
import { pipe } from "fp-ts/lib/pipeable";
import { selectHouseholdById } from "../../households/store/state";
import { database } from "./database";
import { selectTodosByHouseholdIdAndPlantId } from "./state";
import firebase from "firebase";

export const createTodoForPlant = (plantId: string) => (
  householdId: string
) => (todo: Partial<TodoModel> = {}): TE.TaskEither<IErr, TodoModel> =>
  pipe(
    selectHouseholdById(householdId),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.chain(() =>
      TE.tryCatch(
        async () => {
          const id = uuid();
          const todoToSave = makeTodoModel({
            id,
            plantId,
            householdId,
            title: "Water",
            detail: "Give it a little drink if the topsoil is try",
            recurrenceDays: Math.floor(Math.random() * 5) + 1,
            ...todo,
          });
          await database(householdId).doc(id).set(todoToSave);
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
      const batch = firebase.firestore().batch();
      todos.forEach((todo) => batch.delete(database(householdId).doc(todo.id)));
      await batch.commit();
    },
    () => "BAD_REQUEST" as IErr
  );
