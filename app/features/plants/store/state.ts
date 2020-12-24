import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";

import { PlantModel } from "@urban-jungle/shared/models/plant";

import { normalizedStateFactory } from "../../../store/factory";
import { selectCaresForPlant } from "../../care/store/state";
import { selectProfileById2 } from "../../profiles/store/state";

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

export const selectMostLovedByForPlant = (householdId: string) => (
  plantId: string,
) => {
  const profileIdCareCount = selectCaresForPlant(householdId)(plantId).reduce(
    (acc, care) => ({
      ...acc,
      [care.profileId]: acc[care.profileId] ? acc[care.profileId] + 1 : 1,
    }),
    {} as Record<string, number>,
  );
  const profileIdWithMostCares = Object.keys(profileIdCareCount).reduce(
    (prevId, currId) =>
      !prevId
        ? currId
        : profileIdCareCount[currId] > profileIdCareCount[prevId]
        ? currId
        : prevId,
    "",
  );
  return pipe(
    selectProfileById2(profileIdWithMostCares),
    O.map((profile) => ({
      ...profile,
      count: profileIdCareCount[profileIdWithMostCares],
    })),
  );
};

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
