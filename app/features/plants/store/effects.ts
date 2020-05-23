import { BaseModel } from "@urban-jungle/shared/models/base";
import { ImageModel } from "@urban-jungle/shared/models/image";
import { makePhotoModel, PhotoModel } from "@urban-jungle/shared/models/photo";
import { makePlantModel, PlantModel } from "@urban-jungle/shared/models/plant";
import { IErr } from "@urban-jungle/shared/utils/err";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { database } from "../../../database";
import { selectHouseholdById } from "../../households/store/state";
import { selectMostRecentPlantPhoto } from "../../photos/store/state";
import { deleteTodosByPlant } from "../../todos/store/effects";
import { isPlantAvatarThisPhoto, selectPlantByHouseholdId } from "./state";

type Fields = Omit<PlantModel, keyof BaseModel | "householdId" | "avatar"> & {
  avatar: ImageModel;
};

export const upsertPlantForHousehold = (
  { avatar, ...fields }: Partial<Fields> = {},
  plantId: string
) => (householdId: string): TE.TaskEither<IErr, PlantModel> =>
  pipe(
    selectHouseholdById(householdId),
    O.chain(() =>
      plantId
        ? selectPlantByHouseholdId(householdId, plantId)
        : O.fromNullable(makePlantModel())
    ),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.chain((plant) =>
      TE.tryCatch(
        async () => {
          const plantToSave: PlantModel = {
            ...plant,
            ...fields,
            householdId,
          };
          await database.plants
            .database(householdId)
            .doc(plantToSave.id)
            .set(plantToSave);
          return plantToSave;
        },
        () => "BAD_REQUEST" as IErr
      )
    ),
    TE.chainFirst((plant) =>
      savePlantImage(householdId, plant.id, O.fromNullable(avatar))
    )
  );

/**
 * TODOS
 * Make avatar an optional PhotoModel
 * Make sure upload works as expected for both new plants and editing plants
 * Figure out how data fetching works with nested collection
 * ^ May need to update how plants are fetched to include sub-collection?
 * Add state for plant images by plant id
 * Add selector for most recent image for plant
 * Update views to use most recent image for plant
 * Add carousel in plant view for cycling through images
 * Add long press in carousel for deleting an image (with confirmation)
 * Maybe a default flag on an image? Might be good to allow users to choose a primary image
 */

/**
 * Sets a photo in to storage and assigns it to the plant's primary avatar
 * NB: assumes the image is already in firebase storage
 */
export const savePlantImage = (
  householdId: string,
  plantId: string,
  image: O.Option<ImageModel>
): TE.TaskEither<IErr, PhotoModel> =>
  pipe(
    image,
    TE.fromOption(() => "BAD_REQUEST" as IErr),
    TE.chain((img) =>
      TE.tryCatch(
        async () => {
          const photoToSave = makePhotoModel({
            ...img,
            type: "plant",
            householdId,
            associatedId: plantId,
          });
          await database.photos
            .database(householdId)
            .doc(photoToSave.id)
            .set(photoToSave);
          return photoToSave;
        },
        () => "BAD_REQUEST" as IErr
      )
    ),
    TE.chainFirst(setPhotoAsPlantAvatar(householdId, plantId))
  );

export const setPhotoAsPlantAvatar = (householdId: string, plantId: string) => (
  photo: PhotoModel
) =>
  TE.tryCatch(
    async () => {
      await database.plants
        .database(householdId)
        .doc(plantId)
        .set({ avatar: photo }, { merge: true });
    },
    () => "BAD_REQUEST" as IErr
  );

/**
 * Deletes a plant's image from the database.
 * Also checks whether the deleted photo is the plant's primary avatar, if it is
 * it'll set the next most recent photo as the primary avatar (if there is
 * another one!)
 *
 * NB: doesn't remove the image from firebase storage.. should probably do that.
 */
export const deletePlantPhoto = (householdId: string, plantId: string) => (
  photoId: string
): TE.TaskEither<IErr, void> =>
  pipe(
    TE.tryCatch(
      async () => {
        await database.photos.database(householdId).doc(photoId).delete();
      },
      () => "BAD_REQUEST" as IErr
    ),
    TE.chain(() => {
      if (isPlantAvatarThisPhoto(householdId, plantId)(photoId)) {
        return pipe(
          deletePlantAvatar(householdId, plantId)(),
          TE.chain(() =>
            setMostRecentPlantPhotoAsPrimary(householdId, plantId, photoId)
          )
        );
      }
      return TE.right(void null); // no-op if the deleted photo isn't the primary
    })
  );

/**
 * Sets the most recent plant photo as the primary avatar for the plant.
 * Takes an optional ID to filter by (this is useful for when deleting a photo
 * and the state hasn't had a chance to become consistent yet).
 *
 * NB: this is defensive in the sense that it'll only set the most recent photo
 * if there are photos.
 */
export const setMostRecentPlantPhotoAsPrimary = (
  householdId: string,
  plantId: string,
  excludePhotoId?: string
): TE.TaskEither<IErr, void> =>
  pipe(
    selectMostRecentPlantPhoto(householdId, plantId, excludePhotoId),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.chain(setPhotoAsPlantAvatar(householdId, plantId))
  );

/**
 * Deletes the avatar property from the plant.
 * NB: does not remove from the plant's photos subcollection, nor does it
 * actually remove the photo from firebase storage
 */
export const deletePlantAvatar = (householdId: string, plantId: string) => () =>
  TE.tryCatch(
    async () => {
      await database.plants
        .database(householdId)
        .doc(plantId)
        .set(
          { avatar: firebase.firestore.FieldValue.delete() },
          { merge: true }
        );
    },
    () => "BAD_REQUEST" as IErr
  );

export const deletePlantByHouseholdId = (householdId: string) => (
  plantId: string
): TE.TaskEither<IErr, string> =>
  pipe(
    TE.tryCatch(
      async () => {
        await database.plants.database(householdId).doc(plantId).delete();
        return householdId;
      },
      () => "BAD_REQUEST" as IErr
    ),
    TE.chainFirst(() => deleteTodosByPlant(plantId)(householdId))
  );
