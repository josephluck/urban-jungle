import { PlantModel } from "../../../models/plant";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { selectCaresForPlant } from "../../care/store/state";
import { selectProfileById2 } from "../../profiles/store/state";
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

export const selectMostLovedByForPlant = (householdId: string) => (
  plantId: string
) => {
  const profileIdCareCount = selectCaresForPlant(householdId)(plantId).reduce(
    (acc, care) => ({
      ...acc,
      [care.profileId]: acc[care.profileId] ? acc[care.profileId] + 1 : 1,
    }),
    {} as Record<string, number>
  );
  const profileIdWithMostCares = Object.keys(profileIdCareCount).reduce(
    (prevId, currId) =>
      !prevId
        ? currId
        : profileIdCareCount[currId] > profileIdCareCount[prevId]
        ? currId
        : prevId,
    ""
  );
  return pipe(
    selectProfileById2(profileIdWithMostCares),
    O.map((profile) => ({
      ...profile,
      count: profileIdCareCount[profileIdWithMostCares],
    }))
  );
};
