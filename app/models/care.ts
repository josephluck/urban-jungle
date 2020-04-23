import { makeBaseModel, BaseModel } from "./base";
import { TodoModel, makeTodoModel } from "./todo";
import { ProfileModel, makeProfileModel } from "./profile";
import { PlantModel, makePlantModel } from "./plant";

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
  /**
   * Reference at the point in time the care was made
   */
  todo: TodoModel;
  /**
   * Reference at the point in time the care was made
   */
  profile: ProfileModel;
  /**
   * Reference at the point in time the care was made
   */
  plant: PlantModel;
}

export const makeCareModel = (model: Partial<CareModel> = {}): CareModel => ({
  ...makeBaseModel(model),
  profileId: "",
  plantId: "",
  householdId: "",
  todoId: "",
  todo: makeTodoModel(),
  profile: makeProfileModel(),
  plant: makePlantModel(),
  ...model,
});
