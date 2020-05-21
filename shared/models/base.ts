import firebase from "firebase";
import uuid from "uuid";

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
  ...model,
});
