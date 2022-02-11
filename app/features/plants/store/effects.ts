import { BaseModel } from "@urban-jungle/shared/models/base";
import { ImageModel } from "@urban-jungle/shared/models/image";
import { makePhotoModel, PhotoModel } from "@urban-jungle/shared/models/photo";
import { makePlantModel, PlantModel } from "@urban-jungle/shared/models/plant";
import { IErr } from "@urban-jungle/shared/utils/err";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { trimBase64FromImage } from "../../../components/camera";
import { database } from "../../../database";
import { selectHouseholdById } from "../../households/store/state";
import { deleteTodosByPlant } from "../../todos/store/effects";
import { selectPlantByHouseholdId } from "./state";

// TODO: move this as an export in top level state as it's shared?
export type PlantFields = Omit<
  PlantModel,
  keyof BaseModel | "householdId" | "avatar"
> & {
  avatar: ImageModel;
};

export const upsertPlantForHousehold = (
  { avatar, ...fields }: Partial<PlantFields> = {},
  plantId?: string,
) => (householdId: string): TE.TaskEither<IErr, PlantModel> =>
  pipe(
    selectHouseholdById(householdId),
    O.chain(() =>
      plantId
        ? selectPlantByHouseholdId(householdId, plantId)
        : O.fromNullable(makePlantModel()),
    ),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.map((plant) => ({
      ...plant,
      ...fields,
      householdId,
    })),
    TE.chainFirst((plant) =>
      TE.tryCatch(
        () => database.plants.database(householdId).doc(plant.id).set(plant),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.chainFirst((plant) =>
      savePlantImage(householdId, plant.id, O.fromNullable(avatar)),
    ),
  );

/**
 * Sets a photo in to storage and assigns it to the plant's primary avatar
 * NB: assumes the image is already in firebase storage
 */
export const savePlantImage = (
  householdId: string,
  plantId: string,
  image: O.Option<ImageModel>,
): TE.TaskEither<IErr, PhotoModel> =>
  pipe(
    image,
    O.map(trimBase64FromImage),
    TE.fromOption(() => "BAD_REQUEST" as IErr),
    TE.map((img) =>
      makePhotoModel({
        ...img,
        type: "plant",
        householdId,
        associatedId: plantId,
      }),
    ),
    TE.chainFirst((photo) =>
      TE.tryCatch(
        () => database.photos.database(householdId).doc(photo.id).set(photo),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.chainFirst(setPhotoAsPlantAvatar(householdId, plantId)),
  );

export const setPhotoAsPlantAvatar = (householdId: string, plantId: string) => (
  photo: PhotoModel,
): TE.TaskEither<IErr, void> =>
  pipe(
    TE.right(photo),
    TE.map(trimBase64FromImage),
    TE.chain(() =>
      TE.tryCatch(
        () =>
          database.plants
            .database(householdId)
            .doc(plantId)
            .update({ avatar: photo }),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

/**
 * Deletes a plant's image from the database.
 *
 * NB: doesn't remove the image from firebase storage.. should probably do that.
 */
export const deletePlantPhoto = (householdId: string, plantId: string) => (
  photoId: string,
): TE.TaskEither<IErr, void> =>
  pipe(
    TE.tryCatch(
      async () => {
        await database.photos.database(householdId).doc(photoId).delete();
      },
      () => "BAD_REQUEST" as IErr,
    ),
    TE.chain(() => {
      return pipe(deletePlantAvatar(householdId, plantId)());
    }),
  );

/**
 * Deletes the avatar property from the plant.
 * NB: does not remove from the plant's photos subcollection, nor does it
 * actually remove the photo from firebase storage
 */
export const deletePlantAvatar = (
  householdId: string,
  plantId: string,
) => (): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () =>
      database.plants
        .database(householdId)
        .doc(plantId)
        .set(
          { avatar: firebase.firestore.FieldValue.delete() },
          { merge: true },
        ),
    () => "BAD_REQUEST" as IErr,
  );

// TODO: delete photos associated with this plant
export const deletePlantByHouseholdId = (householdId: string) => (
  plantId: string,
): TE.TaskEither<IErr, string> =>
  pipe(
    TE.tryCatch(
      async () => {
        await database.plants.database(householdId).doc(plantId).delete();
        return householdId;
      },
      () => "BAD_REQUEST" as IErr,
    ),
    TE.chainFirst(() => deleteTodosByPlant(plantId)(householdId)),
  );
