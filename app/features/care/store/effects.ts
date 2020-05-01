import * as TE from "fp-ts/lib/TaskEither";
import * as O from "fp-ts/lib/Option";
import { CareModel, makeCareModel } from "../../../models/care";
import { IErr } from "../../../utils/err";
import uuid from "uuid";
import { pipe } from "fp-ts/lib/pipeable";
import { selectHouseholdById } from "../../households/store/state";
import { database } from "./database";
import { selectCurrentUserId } from "../../auth/store/state";
import { selectTodoByHouseholdId } from "../../todos/store/state";
import { sequenceT } from "fp-ts/lib/Apply";
import { selectProfileById2 } from "../../profiles/store/state";
import { selectPlantByHouseholdId } from "../../plants/store/state";

const sequenceO = sequenceT(O.option);

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
          const id = uuid();
          const careToSave = makeCareModel({
            todoId,
            profileId,
            plantId,
            householdId,
            todo,
            plant,
            profile,
          });
          await database(householdId).doc(id).set(careToSave);
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
