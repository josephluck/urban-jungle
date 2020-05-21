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
  recurrenceCount: number;
  /**
   * When this todo should recur
   */
  recurrenceInterval: "months" | "weeks" | "days";
  /**
   * The months of the year that this todo is active for.
   * Can be used to turn off this todo for months of the year that it's not
   * relevant.
   *
   * NB: this is zero indexed.
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

export const makeTodoModel = (
  model: Partial<TodoModel> = {},
  id?: string
): TodoModel => ({
  ...makeBaseModel(model, id),
  plantId: "",
  householdId: "",
  recurrenceCount: 1,
  recurrenceInterval: "days",
  activeInMonths: [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11],
  title: "",
  detail: "",
  ...model,
});
