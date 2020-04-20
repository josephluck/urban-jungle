import firebase from "firebase";
import * as TE from "fp-ts/lib/TaskEither";
import { TodoModel } from "../../../types";
import { IErr } from "../../../utils/err";
import uuid from "uuid";
import { pipe } from "fp-ts/lib/pipeable";
import { selectHouseholdById } from "../../households/store/state";
import { database } from "./database";

export const createTodoForPlant = (plantId: string) => (
  householdId: string
): TE.TaskEither<IErr, TodoModel> =>
  pipe(
    selectHouseholdById(householdId),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.chain(() =>
      TE.tryCatch(
        async () => {
          const id = uuid();
          const todoToSave: TodoModel = {
            plantId,
            householdId,
            id,
            recurrenceDays: 3,
            activeInMonths: Array.from({ length: 11 }).map((_, i) => i), // NB: all months
            dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
            title: "Water",
            detail: "Give it a little drink if the topsoil is try",
          };
          await database(householdId).doc(id).set(todoToSave);
          return todoToSave;
        },
        () => "BAD_REQUEST" as IErr
      )
    )
  );
