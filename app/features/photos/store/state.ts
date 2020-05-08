import { PhotoModel } from "../../../models/photo";
import { normalizedStateFactory } from "../../../store/factory";

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
