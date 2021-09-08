import { sequenceSO } from "@urban-jungle/shared/fp/option";
import { CareModel, makeCareModel } from "@urban-jungle/shared/models/care";
import { IErr } from "@urban-jungle/shared/utils/err";
import firebase from "firebase";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { database } from "../../../database";
import { selectCurrentUserId } from "../../auth/store/state";
import { selectPlantByHouseholdId } from "../../plants/store/state";
import { selectProfileById2 } from "../../profiles/store/state";
import {
  updateTodoLastDone,
  updateTodosLastDone,
} from "../../todos/store/effects";
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

export const createCaresForPlant = (householdId: string) => (
  profileId: string,
) => (
  ids: { plantId: string; todoId: string }[],
): TE.TaskEither<IErr, CareModel[]> => {
  const models = A.sequence(O.option)(
    ids.map(({ plantId, todoId }) =>
      pipe(
        sequenceSO({
          todo: selectTodoByHouseholdId(householdId, todoId),
          plant: selectPlantByHouseholdId(householdId, plantId),
          profile: selectProfileById2(profileId),
        }),
        O.map((relatedEntities) =>
          makeCareModel({
            todoId,
            profileId,
            plantId,
            householdId,
            ...relatedEntities,
          }),
        ),
      ),
    ),
  );
  return pipe(
    models,
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.chainFirst((cares) =>
      TE.tryCatch(
        async () => {
          const batch = firebase.firestore().batch();
          cares.forEach((care) =>
            batch.set(database.cares.database(householdId).doc(care.id), care),
          );
          await batch.commit();
        },
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.chainFirst(updateTodosLastDone(householdId)(profileId)),
  );
};

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
