import * as TE from "fp-ts/lib/TaskEither";
import { Plant, Household } from "../../../types";
import { IErr } from "../../../utils/err";
import { database } from "../../households/store/database";
import uuid from "uuid";
import { pipe } from "fp-ts/lib/pipeable";
import { selectHouseholdById } from "../../households/store/state";

export const createPlantForHousehold = (
  plant: Partial<Omit<Plant, "id">> = defaultPlant
) => (householdId: string): TE.TaskEither<IErr, Plant> =>
  pipe(
    selectHouseholdById(householdId),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.chain(household =>
      TE.tryCatch(
        async () => {
          const id = uuid();
          const plantToSave: Plant = {
            ...defaultPlant,
            ...plant,
            householdId,
            id
          };
          const householdToSave: Household = {
            ...household,
            plants: { ...household.plants, [id]: plantToSave }
          };
          await database()
            .doc(householdId)
            .set(householdToSave);
          return plantToSave;
        },
        () => "BAD_REQUEST" as IErr
      )
    )
  );

const defaultPlant: Omit<Plant, "id" | "householdId"> = {
  name: "A cactus, I think...",
  location: "default",
  careRecurrenceDays: 7
};
