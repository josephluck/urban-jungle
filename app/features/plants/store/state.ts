import { PlantModel } from "../../../models/plant";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { selectCaresForPlant } from "../../care/store/state";
import { selectProfileById2 } from "../../profiles/store/state";
import { normalizedStateFactory } from "../../../store/factory";
import { PhotoModel } from "../../../models/photo";
import { store, State } from "../../../store/state";
import { sortByMostRecent } from "../../../utils/sort";

const methods = normalizedStateFactory<PlantModel>("plants");

export const selectNormalizedPlantsByHouseholdId = methods.selectNormalized;
export const selectPlantsByHouseholdId = methods.selectMany;
export const selectPlantIdsByHouseholdId = methods.selectManyIds;
export const selectPlantByHouseholdId = methods.select;
export const selectPlantsByIds = methods.selectManyByIds;

export const upsertPlant = methods.upsert;
export const upsertPlants = store.createSelector(
  (state: State, householdId: string, plants: PlantModel[]) => {
    plants.forEach((plant) => {
      if (!state.plants.byHouseholdId[householdId]) {
        state.plants.byHouseholdId[householdId] = {};
      }
      state.plants.byHouseholdId[householdId][plant.id] = plant;
      if (plant.avatar) {
        if (!state.plants.photosById[plant.id]) {
          state.plants.photosById[plant.id] = {};
        }
        state.plants.photosById[plant.id][plant.avatar.id] = plant.avatar;
      }
    });
  }
);
export const removePlant = methods.remove;
export const removePlants = methods.removeMany;

export const upsertPlantsPhotos = store.createMutator(
  (s, plantId: string, photos: PhotoModel[]) => {
    photos.forEach((photo) => {
      if (!s.plants.photosById[plantId]) {
        s.plants.photosById[plantId] = {};
      }
      s.plants.photosById[plantId][photo.id] = photo;
    });
  }
);

export const removePlantsPhotos = store.createMutator(
  (s, plantId: string, photos: PhotoModel[]) => {
    photos.forEach((photo) => {
      delete s.plants.photosById[plantId][photo.id];
    });
  }
);

export const selectPhotosForPlant = store.createSelector(
  (state, plantId: string): PhotoModel[] =>
    pipe(
      O.fromNullable(state.plants.photosById[plantId]),
      O.map((photos) => Object.values(photos) as PhotoModel[]),
      O.getOrElse(() => [] as PhotoModel[])
    )
);

export const selectMostRecentPlantPhoto = (
  plantId: string,
  excludeId?: string
): O.Option<PhotoModel> =>
  O.fromNullable(
    selectPhotosForPlant(plantId)
      .filter((photo) => photo.id !== excludeId)
      .sort(sortByMostRecent)[0]
  );

export const isPlantAvatarThisPhoto = (
  householdId: string,
  plantId: string
) => (photoId: string) =>
  pipe(
    selectPlantByHouseholdId(householdId, plantId),
    O.chain((plant) => O.fromNullable(plant.avatar)),
    O.fold(
      () => false,
      (photo) => photo.id === photoId
    )
  );

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

export const selectUniqueLocations = (householdId: string): string[] => [
  ...new Set(
    selectPlantsByHouseholdId(householdId)
      .map((plant) => plant.location)
      .filter(Boolean) as string[]
  ),
];
