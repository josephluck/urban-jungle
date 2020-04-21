import { BaseModel } from "./base";

export interface HouseholdModel extends BaseModel {
  /**
   * The Household's name.
   */
  name: string;
  /**
   * List of profile ids that can manage the Household.
   */
  profileIds: string[];
}
