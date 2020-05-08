import { BaseModel, makeBaseModel } from "./base";
import { ImageModel, makeImageModel } from "./image";

export interface PhotoModel extends BaseModel, ImageModel {}

export const makePhotoModel = (
  model: Partial<PhotoModel> = {}
): PhotoModel => ({
  ...makeBaseModel(model),
  ...makeImageModel(model),
  ...model,
});
