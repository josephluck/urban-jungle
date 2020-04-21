import { makeBaseModel, BaseModel } from "./base";

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

export const makeCareModel = (model: Partial<CareModel> = {}): CareModel => ({
  ...makeBaseModel(model),
  profileId: "",
  plantId: "",
  householdId: "",
  todoId: "",
  ...model,
});
