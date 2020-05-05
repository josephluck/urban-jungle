import * as TE from "fp-ts/lib/TaskEither";
import { PlantModel, makePlantModel } from "../../../models/plant";
import { IErr } from "../../../utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import { selectHouseholdById } from "../../households/store/state";
import { database } from "./database";
import { deleteTodosByPlant } from "../../todos/store/effects";

export const createPlantForHousehold = (
  plant: Partial<Omit<PlantModel, "id">> = {}
) => (householdId: string): TE.TaskEither<IErr, PlantModel> =>
  pipe(
    selectHouseholdById(householdId),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.chain(() =>
      TE.tryCatch(
        async () => {
          const plantToSave = makePlantModel({
            ...plant,
            householdId,
          });
          await database(householdId).doc(plantToSave.id).set(plantToSave);
          return plantToSave;
        },
        () => "BAD_REQUEST" as IErr
      )
    )
  );

/**
 * TODO: also delete todos associated with this plant
 */
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
