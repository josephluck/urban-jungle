import { BaseModel, makeBaseModel } from "./base";

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

export const makeTodoModel = (model: Partial<TodoModel> = {}): TodoModel => ({
  ...makeBaseModel(model),
  plantId: "",
  householdId: "",
  recurrenceDays: 1,
  activeInMonths: [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11],
  title: "",
  detail: "",
  ...model,
});
