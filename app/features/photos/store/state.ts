import { PhotoModel } from "@urban-jungle/shared/models/photo";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
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

export const selectPhotosForPlant = (
  householdId: string,
  plantId: string,
): O.Option<PhotoModel> =>
  pipe(
    O.fromNullable(
      selectPhotosByHouseholdId(householdId).filter(
        (photo) => photo.associatedId === plantId,
      )[0],
    ),
    O.filter((photo) => Boolean(photo.uri)),
  );
