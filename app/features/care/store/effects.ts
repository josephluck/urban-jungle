import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";

import { sequenceSO } from "@urban-jungle/shared/fp/option";
import { CareModel, makeCareModel } from "@urban-jungle/shared/models/care";
import { IErr } from "@urban-jungle/shared/utils/err";

import { database } from "../../../database";
import { selectCurrentUserId } from "../../auth/store/state";
import { selectPlantByHouseholdId } from "../../plants/store/state";
import { selectProfileById2 } from "../../profiles/store/state";
import { updateTodoLastDone } from "../../todos/store/effects";
import { selectTodoByHouseholdId } from "../../todos/store/state";

export const createCareForPlant = (profileId: string) => (todoId: string) => (
  plantId: string,
) => (householdId: string): TE.TaskEither<IErr, CareModel> =>
  pipe(
    sequenceSO({
      todo: selectTodoByHouseholdId(householdId, todoId),
      plant: selectPlantByHouseholdId(householdId, plantId),
      profile: selectProfileById2(profileId),
    }),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.map((relatedEntities) =>
      makeCareModel({
        todoId,
        profileId,
        plantId,
        householdId,
        ...relatedEntities,
      }),
    ),
    TE.chainFirst((care) =>
      TE.tryCatch(
        () => database.cares.database(householdId).doc(care.id).set(care),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.chainFirst((care) =>
      updateTodoLastDone(householdId, profileId, care)(todoId),
    ),
  );

export const createCareForPlantByCurrentProfileId = (todoId: string) => (
  plantId: string,
) => (householdId: string): TE.TaskEither<IErr, CareModel> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as const),
    TE.chain((profileId) =>
      createCareForPlant(profileId)(todoId)(plantId)(householdId),
    ),
  );
