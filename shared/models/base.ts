import firebase from "firebase";
import { v4 as uuid } from "uuid";

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

export const makeBaseModel = (
  model: Partial<BaseModel> = {},
  id?: string
): BaseModel => ({
  id: id || uuid(),
  dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
  ...cleanObj(model),
});

/**
 * Removes undefined values from an object (shallow only)
 */
export const cleanObj = <T extends Record<string, unknown>>(obj: T): T =>
  Object.entries(obj).reduce(
    (acc, [key, value]) =>
      typeof value === "undefined" ? acc : { ...acc, [key]: value },
    {} as T
  );
