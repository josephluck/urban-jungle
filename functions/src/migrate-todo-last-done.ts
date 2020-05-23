import { IErr } from "@urban-jungle/shared/utils/err";
import * as A from "fp-ts/lib/Array";
import { array, flatten } from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { database, getHouseholdsWithPlantsTodosAndCares } from "./api";
import { selectMostRecentCareForTodo } from "./state";

/**
 * Migrates todos to include the last care that was done, and who it was done by
 */
export const handleMigrateTodoLastDone = (): TE.TaskEither<IErr, void[]> =>
  pipe(
    getHouseholdsWithPlantsTodosAndCares(),
    TE.mapLeft((err) => [err]),
    TE.map((householdsData) =>
      householdsData.map((householdData) =>
        householdData.todos.map((todo) => ({
          todo,
          care: selectMostRecentCareForTodo(
            householdData.household.id,
            householdData.cares
          )(todo.id),
        }))
      )
    ),
    TE.map(flatten),
    TE.chain((todos) =>
      array.traverse(TEValidation)(
        todos.map((todo) =>
          pipe(
            todo.care,
            TE.fromOption(() => "NOT_FOUND" as IErr),
            TE.chain((care) =>
              TE.tryCatch(
                async () => {
                  return await database.todos
                    .database(todo.todo.householdId)
                    .doc(todo.todo.id)
                    .update({
                      dateLastDone: care.dateCreated,
                      lastDoneBy: care.profileId,
                    });
                },
                () => "UNKNOWN" as IErr
              )
            )
          )
        ),
        TE.mapLeft(A.of)
      )
    ),
    TE.mapLeft(() => "UNKNOWN" as IErr)
  );

const TEValidation = TE.getTaskValidation(A.getMonoid<IErr>());
