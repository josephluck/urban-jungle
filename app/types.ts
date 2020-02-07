import firebase from "firebase";

export interface BaseModel {
  /**
   * Primary key.
   */
  id: string;
  /**
   * When the entity was created.
   * NB: uses firebase.firestore.Timestamp.fromDate(new Date())
   */
  dateCreated: firebase.firestore.Timestamp;
}

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

export interface HouseholdModel extends BaseModel {
  /**
   * The Household's name.
   */
  name: string;
  /**
   * List of profile ids that can manage the Household.
   */
  profileIds: string[];
  /**
   * A Firestore sub-collection of Plants belonging to the Household.
   * https://firebase.google.com/docs/firestore/manage-data/structure-data#subcollections
   * TODO: check that this is returned on a household...
   */
  plants: PlantModel[];
}

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
   * How many dates between Care sessions. Used to schedule Care notifications.
   */
  careRecurrenceDays: number;
  /**
   * Where this Plant is inside the Household.
   */
  location?: string;
  /**
   * An optional name for the plant. Takes precedence over name when provided.
   */
  nickname?: string;
  /**
   * A Firestore sub-collection of Care entries done for the Plant.
   * https://firebase.google.com/docs/firestore/manage-data/structure-data#subcollections
   * TODO: check that this is returned on a plant...
   */
  cares: CareModel[];
}

export interface CareModel extends BaseModel {
  /**
   * The profile ID of the user that did this care.
   */
  profileId: string;
  /**
   * The Plant that this care was done for.
   */
  plantId: string;
  /**
   * The Household that this care was done for.
   */
  householdId: string;
}

export interface DatabaseModel {
  profiles: Record<string, ProfileModel>;
  households: Record<string, HouseholdModel>;
}
