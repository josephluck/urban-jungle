import { PlantModel } from "../../../types";
import { normalizeArrayById } from "../../../utils/normalize";
import { store } from "../../../store/state";

export const selectNormalizedPlantsByHouseholdId = store.createSelector(
  (s, householdId: string) => s.plants.plantsByHouseholdId[householdId]
);

export const selectPlantsByHouseholdId = (householdId: string) =>
  Object.values(selectNormalizedPlantsByHouseholdId(householdId));

export const setPlants = store.createMutator(
  (s, householdId: string, plants: PlantModel[]) => {
    s.plants.plantsByHouseholdId[householdId] = {
      ...s.plants.plantsByHouseholdId[householdId],
      ...normalizeArrayById(plants)
    };
  }
);

export const upsertPlant = store.createMutator(
  (s, householdId: string, plant: PlantModel) => {
    s.plants.plantsByHouseholdId[householdId][plant.id] = plant;
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
