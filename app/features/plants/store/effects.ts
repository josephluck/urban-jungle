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

export const upsertPlantForHousehold = (
  fields: Partial<Omit<PlantModel, keyof BaseModel | "householdId">> = {},
  plantId?: string
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
          const plantToSave = {
            ...plant,
            ...fields,
            householdId,
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
