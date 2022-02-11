import { PlantModel } from "@urban-jungle/shared/models/plant";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { normalizedStateFactory } from "../../../store/factory";

const methods = normalizedStateFactory<PlantModel>("plants");

export const selectNormalizedPlantsByHouseholdId = methods.selectNormalized;
export const selectPlantsByHouseholdId = methods.selectMany;
export const selectPlantIdsByHouseholdId = methods.selectManyIds;
export const selectPlantByHouseholdId = methods.select;
export const selectPlantsByIds = methods.selectManyByIds;

export const upsertPlant = methods.upsert;
export const upsertPlants = methods.upsertMany;
export const removePlant = methods.remove;
export const removePlants = methods.removeMany;

export const selectUniqueLocations = (householdId: string): string[] => [
  ...new Set(
    selectPlantsByHouseholdId(householdId)
      .map((plant) => plant.location)
      .filter(Boolean) as string[],
  ),
];

export const isPlantAvatarThisPhoto = (
  householdId: string,
  plantId: string,
) => (photoId: string) =>
  pipe(
    selectPlantByHouseholdId(householdId, plantId),
    O.chain((plant) => O.fromNullable(plant.avatar)),
    O.fold(
      () => false,
      (photo) => photo.id === photoId,
    ),
  );

export const getPlantName = (plant: PlantModel) =>
  plant.nickname || plant.name || "";

export type PlantsGroup = {
  data: PlantModel[];
  title: string;
};

export const groupPlantsByLocation = () => {
  const groups: PlantsGroup[] = [];
  return (plants: PlantModel[]) => {
    plants.forEach((plant) => {
      const existingGroup = groups.find(
        (group) => group.title === plant.location,
      );
      if (existingGroup) {
        existingGroup.data.push(plant);
      } else {
        groups.push({
          title: plant.location || "Other",
          data: [plant],
        });
      }
    });

    return groups.sort((a, b) => a.title.localeCompare(b.title));
  };
};
