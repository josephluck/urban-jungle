import { useEffect } from "react";

import { CareModel } from "@urban-jungle/shared/models/care";

import { database } from "../../../database";
import { removeCares, upsertCares } from "../store/state";

/**
 * Subscribes to any plants for the given household
 */
export const HouseholdCaresSubscription = ({
  householdId,
}: {
  householdId: string;
}) => {
  useEffect(() => {
    const unsubscribe = database.cares
      .database(householdId)
      .where("householdId", "==", householdId)
      .onSnapshot(handleCareSnapshot(householdId));
    return unsubscribe;
  }, [householdId]);

  return null;
};

const handleCareSnapshot = (householdId: string) => async (
  snapshot: Snapshot,
) => {
  const addedOrModified: CareModel[] = snapshot
    .docChanges()
    .filter((change) => ["added", "modified"].includes(change.type))
    .map((change) => (change.doc.data() as unknown) as CareModel);

  const removed: CareModel[] = snapshot
    .docChanges()
    .filter((change) => change.type === "removed")
    .map((change) => (change.doc.data() as unknown) as CareModel);

  upsertCares(householdId, addedOrModified);
  removeCares(householdId, removed);
};

type Snapshot = firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>;
