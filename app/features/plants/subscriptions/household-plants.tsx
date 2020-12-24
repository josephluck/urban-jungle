import { useEffect } from "react";

import { PlantModel } from "@urban-jungle/shared/models/plant";

import { database } from "../../../database";
import { removePlants, upsertPlants } from "../store/state";

/**
 * Subscribes to any plants for the given household
 */
export const HouseholdPlantsSubscription = ({
  householdId,
}: {
  householdId: string;
}) => {
  useEffect(() => {
    const unsubscribe = database.plants
      .database(householdId)
      .where("householdId", "==", householdId)
      .onSnapshot(handlePlantSnapshot(householdId));
    return unsubscribe;
  }, [householdId]);

  return null;
};

const handlePlantSnapshot = (householdId: string) => async (
  snapshot: Snapshot,
) => {
  const addedOrModified: PlantModel[] = snapshot
    .docChanges()
    .filter((change) => ["added", "modified"].includes(change.type))
    .map((change) => (change.doc.data() as unknown) as PlantModel);

  const removed: PlantModel[] = snapshot
    .docChanges()
    .filter((change) => change.type === "removed")
    .map((change) => (change.doc.data() as unknown) as PlantModel);

  upsertPlants(householdId, addedOrModified);
  removePlants(householdId, removed);
};

type Snapshot = firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>;
