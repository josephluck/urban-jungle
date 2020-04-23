import { BaseModel, makeBaseModel } from "./base";

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
   * Pretty picture of the profile. If not provided, falls back to a placeholder.
   */
  avatar?: string;
}

export const makePlantModel = (
  model: Partial<PlantModel> = {}
): PlantModel => ({
  ...makeBaseModel(model),
  name: "",
  householdId: "",
  ...model,
});
