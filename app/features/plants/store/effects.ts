import * as TE from "fp-ts/lib/TaskEither";
import * as O from "fp-ts/lib/Option";
import { PlantModel, makePlantModel } from "../../../models/plant";
import { IErr } from "../../../utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import { selectHouseholdById } from "../../households/store/state";
import { database, photosDatabase } from "./database";
import { deleteTodosByPlant } from "../../todos/store/effects";
import { selectPlantByHouseholdId } from "./state";
import { BaseModel } from "../../../models/base";
import { ImageModel } from "../../../models/image";
import { PhotoModel, makePhotoModel } from "../../../models/photo";

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
          await database(householdId).doc(plantToSave.id).set(plantToSave);
          return plantToSave;
        },
        () => "BAD_REQUEST" as IErr
      )
    ),
    TE.chainFirst((plant) =>
      uploadPlantImage(householdId, plant.id, O.fromNullable(avatar))
    )
  );

/**
 * TODOS
 * Remove avatar from plant model
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

export const uploadPlantImage = (
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
          const photoToSave: PhotoModel = {
            ...makePhotoModel(img),
          };
          await photosDatabase(householdId)(plantId)
            .doc(photoToSave.id)
            .set(photoToSave);
          return photoToSave;
        },
        () => "BAD_REQUEST" as IErr
      )
    )
  );

export const deletePlantByHouseholdId = (householdId: string) => (
  plantId: string
): TE.TaskEither<IErr, string> =>
  pipe(
    TE.tryCatch(
      async () => {
        await database(householdId).doc(plantId).delete();
        return householdId;
      },
      () => "BAD_REQUEST" as IErr
    ),
    TE.chainFirst(() => deleteTodosByPlant(plantId)(householdId))
  );
