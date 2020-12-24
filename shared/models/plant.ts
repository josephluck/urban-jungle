import { BaseModel, cleanObj, makeBaseModel } from "./base";
import { PhotoModel } from "./photo";

export interface PlantModel extends BaseModel {
  /**
   * Which Household the Plant belongs to.
   */
  householdId: string;
  /**
   * The Plant's name.
   */
  name: string;
  /**
   * Where this Plant is inside the Household.
   */
  location?: string;
  /**
   * An optional name for the plant. Takes precedence over name when provided.
   */
  nickname?: string;
  /**
   * Pretty picture of the plant. If not provided, falls back to a placeholder.
   */
  avatar?: PhotoModel;
}

export const makePlantModel = (
  model: Partial<PlantModel> = {},
  id?: string
): PlantModel => ({
  ...makeBaseModel(model, id),
  name: "",
  householdId: "",
  ...cleanObj(model),
});
