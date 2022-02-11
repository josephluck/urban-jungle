import firebase from "firebase";
import { HouseholdId } from "../models/ids";

export const database = (firestore: firebase.firestore.Firestore) => {
  const profilesDatabase = firestore.collection("profiles");

  const householdsDatabase = firestore.collection("households");

  const todosDatabase = (householdId: HouseholdId) =>
    householdsDatabase.doc(householdId).collection("todos");

  const plantsDatabase = (householdId: HouseholdId) =>
    householdsDatabase.doc(householdId).collection("plants");

  const photosDatabase = (householdId: HouseholdId) =>
    householdsDatabase.doc(householdId).collection("photos");

  return {
    profiles: {
      database: profilesDatabase,
    },
    households: {
      database: householdsDatabase,
    },
    todos: {
      database: todosDatabase,
    },
    plants: {
      database: plantsDatabase,
    },
    photos: {
      database: photosDatabase,
    },
  };
};
