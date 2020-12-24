import { BaseModel, cleanObj, makeBaseModel } from "./base";

export type ThemeSetting = "light" | "dark" | "system";

export interface ProfileModel extends BaseModel {
  /**
   * Profile's first name.
   */
  name: string;
  /**
   * Profile's email (for authentication).
   */
  email?: string;
  /**
   * profile's phone number (for authentication).
   */
  phoneNumber?: string;
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
  /**
   * The theme, when not present, will use the device setting
   */
  theme?: ThemeSetting;
}

export const makeProfileModel = (
  model: Partial<ProfileModel> = {}
): ProfileModel => ({
  ...makeBaseModel(model),
  name: "",
  email: "",
  householdIds: [],
  ...cleanObj(model),
});
