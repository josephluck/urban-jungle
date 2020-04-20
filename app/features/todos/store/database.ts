import { database as householdsDatabase } from "../../households/store/database";

export const database = (householdId: string) =>
  householdsDatabase().doc(householdId).collection("todos");
