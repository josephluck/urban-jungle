import { BaseModel, makeBaseModel } from "./base";
import { StorageEntityType } from "../features/photos/storage";

export interface ImageModel {
  /**
   * The downloadable URI.
   */
  uri: string;
  /**
   * Width in pixels
   */
  width: number;
  /**
   * Height in pixels
   */
  height: number;
}

export interface PhotoModel extends BaseModel, ImageModel {
  /**
   * The ID of the associated entity, aka Profile, Plant
   */
  associatedId: string;
  /**
   * The type of the associated entity
   */
  associatedType: StorageEntityType;
  /**
   * The associated household
   */
  householdId: string;
}

export const makePhotoModel = (
  model: Partial<PhotoModel> = {}
): PhotoModel => ({
  ...makeBaseModel(model),
  ...makeImageModel(model),
  associatedId: "",
  associatedType: "default",
  householdId: "",
  ...model,
});

export const makeImageModel = (
  model: Partial<ImageModel> = {}
): ImageModel => ({
  uri: "",
  width: 0,
  height: 0,
  ...model,
});
