import { TodoModel } from "@urban-jungle/shared/models/todo";
import firebase from "firebase";
import { useEffect } from "react";
import { database } from "../../../database";
import { removeTodos, upsertTodos } from "../../../store/selectors";
import { setFirestoreLoaded } from "../../../store/ui";

/**
 * Subscribes to any todos for the given household
 */
export const HouseholdTodosSubscription = ({
  householdId,
}: {
  householdId: string;
}) => {
  useEffect(() => {
    const unsubscribe = database.todos
      .database(householdId)
      .where("householdId", "==", householdId)
      .onSnapshot(handleTodoSnapshot(householdId));
    return unsubscribe;
  }, [householdId]);

  return null;
};

const handleTodoSnapshot = (householdId: string) => async (
  snapshot: Snapshot,
) => {
  setFirestoreLoaded("todos");
  const addedOrModified: TodoModel[] = snapshot
    .docChanges()
    .filter((change) => ["added", "modified"].includes(change.type))
    .map((change) => (change.doc.data() as unknown) as TodoModel);

  const removed: TodoModel[] = snapshot
    .docChanges()
    .filter((change) => change.type === "removed")
    .map((change) => (change.doc.data() as unknown) as TodoModel);

  upsertTodos(householdId, addedOrModified);
  removeTodos(householdId, removed);
};

type Snapshot = firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>;
