export interface User {
  /**
   * Primary key.
   */
  id: string;
  /**
   * User's name.
   */
  name: string;
  /**
   * User's email (for authentication).
   */
  email: string;
  /**
   * Which Households the user can manage
   */
  householdIds: string[];
  /**
   * Pretty picture of the User. If not provided, falls back to a placeholder.
   */
  avatar?: string;
}

export interface Household {
  /**
   * Primary key.
   */
  id: string;
  /**
   * The Household's name.
   */
  name: string;
  /**
   * List of user ids that can manage the Household.
   */
  userIds: string[];
  /**
   * A Firestore sub-collection of Plants belonging to the Household.
   * https://firebase.google.com/docs/firestore/manage-data/structure-data#subcollections
   */
  plants: Record<string, Plant>;
}

export interface Plant {
  /**
   * Primary key.
   */
  id: string;
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
}

export interface Firestore {
  users: Record<string, User>;
  households: Record<string, Household>;
  plants: Record<string, Plant>;
}
