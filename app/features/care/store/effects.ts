import firebase from "firebase";
import * as TE from "fp-ts/lib/TaskEither";
import { CareModel } from "../../../types";
import { IErr } from "../../../utils/err";
import uuid from "uuid";
import { pipe } from "fp-ts/lib/pipeable";
import { selectHouseholdById } from "../../households/store/state";
import { database } from "./database";
import { selectCurrentUserId } from "../../auth/store/state";

export const createCareForPlant = (profileId: string) => (todoId: string) => (
  plantId: string
) => (householdId: string): TE.TaskEither<IErr, CareModel> =>
  pipe(
    selectHouseholdById(householdId),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.chain(() =>
      TE.tryCatch(
        async () => {
          const id = uuid();
          const careToSave: CareModel = {
            todoId,
            profileId,
            plantId,
            householdId,
            id,
            dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
          };
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
