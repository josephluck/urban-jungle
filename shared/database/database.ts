import { HouseholdId } from "../models/ids";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export const database = (firestore: FirebaseFirestoreTypes.Module) => {
  const profilesDatabase = firestore.collection("profiles");

  const householdsDatabase = firestore.collection("households");

  const todosDatabase = (householdId: HouseholdId) =>
    householdsDatabase.doc(householdId).collection("todos");

  const plantsDatabase = (householdId: HouseholdId) =>
    householdsDatabase.doc(householdId).collection("plants");

  const photosDatabase = (householdId: HouseholdId) =>
    householdsDatabase.doc(householdId).collection("photos");

  const caresDatabase = (householdId: HouseholdId) =>
    householdsDatabase.doc(householdId).collection("cares");

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
    cares: {
      database: caresDatabase,
    },
  };
};
