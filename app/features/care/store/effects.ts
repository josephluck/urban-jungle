import { CareModel, makeCareModel } from "@urban-jungle/shared/models/care";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { database } from "../../../database";
import { sequenceO } from "../../../fp/option";
import { selectCurrentUserId } from "../../auth/store/state";
import { selectHouseholdById } from "../../households/store/state";
import { selectPlantByHouseholdId } from "../../plants/store/state";
import { selectProfileById2 } from "../../profiles/store/state";
import { selectTodoByHouseholdId } from "../../todos/store/state";

export const createCareForPlant = (profileId: string) => (todoId: string) => (
  plantId: string
) => (householdId: string): TE.TaskEither<IErr, CareModel> =>
  pipe(
    sequenceO(
      selectTodoByHouseholdId(householdId, todoId),
      selectPlantByHouseholdId(householdId, plantId),
      selectProfileById2(profileId),
      selectHouseholdById(householdId)
    ),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.chain(([todo, plant, profile]) =>
      TE.tryCatch(
        async () => {
          const careToSave = makeCareModel({
            todoId,
            profileId,
            plantId,
            householdId,
            todo,
            plant,
            profile,
          });
          await database.cares
            .database(householdId)
            .doc(careToSave.id)
            .set(careToSave);
          return careToSave;
        },
        () => "BAD_REQUEST" as IErr
      )
    )
  );

export const createCareForPlantByCurrentProfileId = (todoId: string) => (
  plantId: string
) => (householdId: string): TE.TaskEither<IErr, CareModel> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((profileId) =>
      createCareForPlant(profileId)(todoId)(plantId)(householdId)
    )
  );
