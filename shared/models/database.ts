import { ProfileModel } from "./profile";
import { HouseholdModel } from "./household";

export interface DatabaseModel {
  profiles: Record<string, ProfileModel>;
  households: Record<string, HouseholdModel>;
}
