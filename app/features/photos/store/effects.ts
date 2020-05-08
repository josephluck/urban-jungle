import * as TE from "fp-ts/lib/TaskEither";
import * as O from "fp-ts/lib/Option";
import { PhotoModel, makePhotoModel } from "../../../models/photo";
import { IErr } from "../../../utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import { selectHouseholdById } from "../../households/store/state";
import { database } from "./database";
import { selectPhotoByHouseholdId } from "./state";
import { BaseModel } from "../../../models/base";

export const upsertPhotoForHousehold = (
  fields: Partial<Omit<PhotoModel, keyof BaseModel | "householdId">> = {},
  associatedId: string,
  photoId?: string
) => (householdId: string): TE.TaskEither<IErr, PhotoModel> =>
  pipe(
    selectHouseholdById(householdId),
    O.chain(() =>
      photoId
        ? selectPhotoByHouseholdId(householdId, photoId)
        : O.fromNullable(makePhotoModel())
    ),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.chain((photo) =>
      TE.tryCatch(
        async () => {
          const photoToSave: PhotoModel = {
            ...photo,
            ...fields,
            householdId,
            associatedId,
          };
          await database(householdId).doc(photoToSave.id).set(photoToSave);
          return photoToSave;
        },
        () => "BAD_REQUEST" as IErr
      )
    )
  );

export const deletePhotoByHouseholdId = (householdId: string) => (
  photoId: string
): TE.TaskEither<IErr, string> =>
  pipe(
    TE.tryCatch(
      async () => {
        await database(householdId).doc(photoId).delete();
        return householdId;
      },
      () => "BAD_REQUEST" as IErr
    )
  );
