import { BaseModel, makeBaseModel } from "./base";

export interface ProfileModel extends BaseModel {
  /**
   * Profile's first name.
   */
  name: string;
  /**
   * Profile's last name.
   */
  lastName: string;
  /**
   * profile's email (for authentication).
   */
  email: string;
  /**
   * Which Households the profile can manage.
   */
  householdIds: string[];
  /**
   * Pretty picture of the profile. If not provided, falls back to a placeholder.
   */
  avatar?: string;
  /**
   * The Expo Push token for the user's device
   */
  pushToken?: string;
}

export const makeProfileModel = (
  model: Partial<ProfileModel> = {}
): ProfileModel => ({
  ...makeBaseModel(model),
  name: "",
  lastName: "",
  email: "",
  householdIds: [],
  ...model,
});
