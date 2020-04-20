import firebase from "firebase";
import * as TE from "fp-ts/lib/TaskEither";
import { PlantModel } from "../../../types";
import { IErr } from "../../../utils/err";
import uuid from "uuid";
import { pipe } from "fp-ts/lib/pipeable";
import { selectHouseholdById } from "../../households/store/state";
import { database } from "./database";
import { createTodoForPlant } from "../../todos/store/effects";

export const createPlantForHousehold = (
  plant: Partial<Omit<PlantModel, "id">> = defaultPlant
) => (householdId: string): TE.TaskEither<IErr, PlantModel> =>
  pipe(
    selectHouseholdById(householdId),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.chain(() =>
      TE.tryCatch(
        async () => {
          const id = uuid();
          const plantToSave: PlantModel = {
            ...defaultPlant,
            ...plant,
            householdId,
            id,
            dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
          };
          await database(householdId).doc(id).set(plantToSave);
          return plantToSave;
        },
        () => "BAD_REQUEST" as IErr
      )
    ),
    TE.chainFirst((plant) => createTodoForPlant(plant.id)(householdId))
  );

/**
 * TODO: also delete todos associated with this plant
 */
export const deletePlantByHouseholdId = (householdId: string) => (
  plantId: string
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      await database(householdId).doc(plantId).delete();
    },
    () => "BAD_REQUEST" as IErr
  );

const defaultPlant: Omit<PlantModel, "id" | "dateCreated" | "householdId"> = {
  name: "Cactus",
  location: "default",
};
