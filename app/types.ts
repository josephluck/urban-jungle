import firebase from "firebase";

export type UserId = string;
export type HouseholdId = string;
export type PlantId = string;
export type CareId = string;
export type TodoId = string;

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
   * Where this Plant is inside the Household.
   */
  location?: string;
  /**
   * An optional name for the plant. Takes precedence over name when provided.
   */
  nickname?: string;
}

/**
 * A care is created each time a user actions a todo.
 */
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
  /**
   * The todo ID that this care was done for
   */
  todoId: string;
}

export interface TodoModel extends BaseModel {
  /**
   * The Plant that this todo is for.
   */
  plantId: string;
  /**
   * The Household that this todo is for.
   */
  householdId: string;
  /**
   * How often this todo should be done.
   */
  recurrenceDays: number;
  /**
   * The months of the year that this todo is active for.
   * Can be used to turn off this todo for months of the year that it's not
   * relevant.
   */
  activeInMonths: number[];
  /**
   * The title of the todo.
   */
  title: string;
  /**
   * Some further information about the todo.
   */
  detail: string;
}

export interface DatabaseModel {
  profiles: Record<string, ProfileModel>;
  households: Record<string, HouseholdModel>;
}
