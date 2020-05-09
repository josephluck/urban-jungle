import { BaseModel, makeBaseModel } from "./base";
import { ImageModel, makeImageModel } from "./image";
import { StorageEntityType } from "../features/photos/storage";

export interface PhotoModel extends BaseModel, ImageModel {
  /**
   * The type of photo this is (and where it's stored)
   */
  type: StorageEntityType;
  /**
   * The household this plant is in
   */
  householdId: string;
  /**
   * The ID of the associated entity, aka plant id if it's an image of a plant
   */
  associatedId: string;
}

export const makePhotoModel = (
  model: Partial<PhotoModel> = {}
): PhotoModel => ({
  ...makeBaseModel(model),
  ...makeImageModel(model),
  type: "default",
  associatedId: "",
  householdId: "",
  ...model,
});
