import { PlantModel } from "../../../models/plant";
import { store } from "../../../store/state";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";

export const selectNormalizedPlantsByHouseholdId = store.createSelector(
  (s, householdId: string): O.Option<Record<string, PlantModel>> =>
    O.fromNullable(s.plants.plantsByHouseholdId[householdId])
);

export const selectPlantsByHouseholdId = (householdId: string): PlantModel[] =>
  pipe(
    selectNormalizedPlantsByHouseholdId(householdId),
    O.map(Object.values),
    O.getOrElse(() => [] as PlantModel[])
  );

export const selectPlantIdsByHouseholdId = (householdId: string): string[] =>
  pipe(
    selectNormalizedPlantsByHouseholdId(householdId),
    O.map(Object.keys),
    O.getOrElse(() => [] as string[])
  );

export const selectPlantByHouseholdAndId = (householdId: string) => (
  plantId: string
): O.Option<PlantModel> =>
  pipe(
    selectNormalizedPlantsByHouseholdId(householdId),
    O.chain((plants) => O.fromNullable(plants[plantId]))
  );

export const upsertPlant = store.createMutator(
  (s, householdId: string, plant: PlantModel) => {
    s.plants.plantsByHouseholdId[householdId] = {
      ...s.plants.plantsByHouseholdId[householdId],
      [plant.id]: plant,
    };
  }
);

export const deletePlant = store.createMutator(
  (s, householdId: string, plantId: string) => {
    delete s.plants.plantsByHouseholdId[householdId][plantId];
  }
);

export const upsertPlantByHouseholdId = (householdId: string) => (
  plant: PlantModel
) => upsertPlant(householdId, plant);

export const deletePlantbyHouseholdId = (householdId: string) => (
  plantId: string
) => deletePlant(householdId, plantId);
