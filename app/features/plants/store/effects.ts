import * as TE from "fp-ts/lib/TaskEither";
import * as O from "fp-ts/lib/Option";
import { PlantModel, makePlantModel } from "../../../models/plant";
import { IErr } from "../../../utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import { selectHouseholdById } from "../../households/store/state";
import { database } from "./database";
import { deleteTodosByPlant } from "../../todos/store/effects";
import { selectPlantByHouseholdId } from "./state";
import { BaseModel } from "../../../models/base";
import uuid from "uuid";
import { upsertPhotoForHousehold } from "../../photos/store/effects";
import { ImageModel } from "../../../models/photo";

type Fields = Omit<PlantModel, keyof BaseModel | "householdId" | "avatar"> & {
  image: ImageModel;
};

export const upsertPlantForHousehold = (
  { image, ...fields }: Partial<Fields> = {},
  plantId: string = uuid()
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
      image
        ? savePlantWithImage(plant, plantId, householdId, fields, image)
        : savePlantWithoutImage(plant, plantId, householdId, fields)
    )
  );

export const savePlantWithoutImage = (
  plant: PlantModel,
  plantId: string,
  householdId: string,
  fields: Partial<Fields>
) =>
  pipe(
    TE.tryCatch(
      async () => {
        const plantToSave = {
          ...plant,
          ...fields,
          householdId,
          plantId,
        };
        await database(householdId).doc(plantToSave.id).set(plantToSave);
        return plantToSave;
      },
      () => "BAD_REQUEST" as IErr
    )
  );

export const savePlantWithImage = (
  plant: PlantModel,
  plantId: string,
  householdId: string,
  fields: Partial<Fields>,
  image: ImageModel
) =>
  pipe(
    upsertPhotoForHousehold(
      { ...image, associatedType: "plant" },
      plantId
    )(householdId),
    TE.chain((photo) =>
      TE.tryCatch(
        async () => {
          const plantToSave = {
            ...plant,
            ...fields,
            householdId,
            plantId,
            avatar: photo.uri,
          };
          await database(householdId).doc(plantToSave.id).set(plantToSave);
          return plantToSave;
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
