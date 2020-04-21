import { database } from "../store/database";
import { useEffect } from "react";
import { TodoModel } from "../../../models/todo";
import {
  upsertTodoByHouseholdId,
  deleteTodobyHouseholdId,
} from "../store/state";

/**
 * Subscribes to any plants for the given household
 */
export const HouseholdTodosSubscription = ({
  householdId,
}: {
  householdId: string;
}) => {
  useEffect(() => {
    const unsubscribe = database(householdId)
      .where("householdId", "==", householdId)
      .onSnapshot(handleTodoSnapshot(householdId));
    return unsubscribe;
  }, [householdId]);

  return null;
};

const handleTodoSnapshot = (householdId: string) => async (
  snapshot: Snapshot
) => {
  const addedOrModified: TodoModel[] = snapshot
    .docChanges()
    .filter((change) => ["added", "modified"].includes(change.type))
    .map((change) => (change.doc.data() as unknown) as TodoModel);
  const removed: TodoModel[] = snapshot
    .docChanges()
    .filter((change) => change.type === "removed")
    .map((change) => (change.doc.data() as unknown) as TodoModel);
  addedOrModified.map(upsertTodoByHouseholdId(householdId));
  removed.map((plant) => plant.id).map(deleteTodobyHouseholdId(householdId));
};

type Snapshot = firebase.firestore.QuerySnapshot<
  firebase.firestore.DocumentData
>;
