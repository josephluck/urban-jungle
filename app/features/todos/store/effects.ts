import firebase from "firebase";
import * as TE from "fp-ts/lib/TaskEither";
import { TodoModel } from "../../../models/todo";
import { IErr } from "../../../utils/err";
import uuid from "uuid";
import { pipe } from "fp-ts/lib/pipeable";
import { selectHouseholdById } from "../../households/store/state";
import { database } from "./database";
import { selectTodosByHouseholdIdAndPlantId } from "./state";

export const createTodoForPlant = (plantId: string) => (
  householdId: string
) => (todo: Partial<TodoModel> = defaultTodo): TE.TaskEither<IErr, TodoModel> =>
  pipe(
    selectHouseholdById(householdId),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.chain(() =>
      TE.tryCatch(
        async () => {
          const id = uuid();
          const todoToSave: TodoModel = {
            ...defaultTodo,
            ...todo,
            plantId,
            householdId,
            id,
            dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
          };
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
      const db = database(householdId);
      await Promise.all(todos.map((todo) => db.doc(todo.id).delete()));
    },
    () => "BAD_REQUEST" as IErr
  );

const defaultTodo: Omit<
  TodoModel,
  "id" | "householdId" | "plantId" | "dateCreated"
> = {
  recurrenceDays: Math.floor(Math.random() * 6) + 1,
  activeInMonths: Array.from({ length: 11 }).map((_, i) => i), // NB: all months
  title: "Water",
  detail: "Give it a little drink if the topsoil is try",
};
