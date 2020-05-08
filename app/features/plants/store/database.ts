import { database as householdsDatabase } from "../../households/store/database";

export const database = (householdId: string) =>
  householdsDatabase().doc(householdId).collection("plants");

export const photosDatabase = (householdId: string) => (plantId: string) =>
  database(householdId).doc(plantId).collection("photos");
