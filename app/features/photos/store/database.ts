import { database as householdsDatabase } from "../../households/store/database";

export const photosDatabase = (householdId: string) =>
  householdsDatabase().doc(householdId).collection("photos");
