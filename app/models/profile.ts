import { BaseModel, makeBaseModel } from "./base";

export interface ProfileModel extends BaseModel {
  /**
   * profile's name.
   */
  name: string;
  /**
   * profile's email (for authentication).
   */
  email: string;
  /**
   * Which Households the profile can manage
   */
  householdIds: string[];
  /**
   * Pretty picture of the profile. If not provided, falls back to a placeholder.
   */
  avatar?: string;
}

export const makeProfileModel = (
  model: Partial<ProfileModel> = {}
): ProfileModel => ({
  ...makeBaseModel(model),
  name: "",
  email: "",
  householdIds: [],
  ...model,
});
