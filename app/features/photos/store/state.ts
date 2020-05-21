import { PhotoModel } from "@urban-jungle/shared/models/photo";
import * as O from "fp-ts/lib/Option";
import { normalizedStateFactory } from "../../../store/factory";
import { sortByMostRecent } from "../../../utils/sort";

const methods = normalizedStateFactory<PhotoModel>("photos");

export const selectNormalizedPhotosByHouseholdId = methods.selectNormalized;
export const selectPhotosByHouseholdId = methods.selectMany;
export const selectPhotoIdsByHouseholdId = methods.selectManyIds;
export const selectPhotoByHouseholdId = methods.select;
export const selectPhotosByIds = methods.selectManyByIds;

export const upsertPhoto = methods.upsert;
export const upsertPhotos = methods.upsertMany;
export const removePhoto = methods.remove;
export const removePhotos = methods.removeMany;

export const selectPhotosForPlant = (householdId: string, plantId: string) =>
  selectPhotosByHouseholdId(householdId).filter(
    (photo) => photo.associatedId === plantId
  );

export const selectMostRecentPlantPhoto = (
  householdId: string,
  plantId: string,
  excludeId?: string
): O.Option<PhotoModel> =>
  O.fromNullable(
    selectPhotosForPlant(householdId, plantId)
      .filter((photo) => photo.id !== excludeId)
      .sort(sortByMostRecent)[0]
  );
