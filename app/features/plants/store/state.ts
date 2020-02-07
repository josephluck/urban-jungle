import stately from "@josephluck/stately";
import { PlantModel } from "../../../types";
import { normalizeArrayById } from "../../../utils/normalize";
import makeUseStately from "@josephluck/stately/lib/hooks";

interface PlantsState {
  plantsByHouseholdId: Record<string, Record<string, PlantModel>>;
}

const store = stately<PlantsState>({
  plantsByHouseholdId: {}
});

export const selectNormalizedPlantsByHouseholdId = store.createSelector(
  (s, householdId: string) => s.plantsByHouseholdId[householdId]
);

export const selectPlantsByHouseholdId = (householdId: string) =>
  Object.values(selectNormalizedPlantsByHouseholdId(householdId));

export const setPlants = store.createMutator(
  (s, householdId: string, plants: PlantModel[]) => {
    s.plantsByHouseholdId[householdId] = {
      ...s.plantsByHouseholdId[householdId],
      ...normalizeArrayById(plants)
    };
  }
);

export const upsertPlant = store.createMutator(
  (s, householdId: string, plant: PlantModel) => {
    s.plantsByHouseholdId[householdId][plant.id] = plant;
  }
);

export const deletePlant = store.createMutator(
  (s, householdId: string, plantId: string) => {
    delete s.plantsByHouseholdId[householdId][plantId];
  }
);

export const upsertPlantByHouseholdId = (householdId: string) => (
  plant: PlantModel
) => upsertPlant(householdId, plant);

export const deletePlantbyHouseholdId = (householdId: string) => (
  plantId: string
) => deletePlant(householdId, plantId);

export const usePlantsStore = makeUseStately(store);
