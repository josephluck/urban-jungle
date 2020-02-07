import { database } from "../store/database";
import { useEffect } from "react";
import { PlantModel } from "../../../types";
import {
  upsertPlantByHouseholdId,
  deletePlantbyHouseholdId
} from "../store/state";

/**
 * Subscribes to any plants for the given household
 */
export const HouseholdPlantsSubscription = ({
  householdId
}: {
  householdId: string;
}) => {
  useEffect(() => {
    const unsubscribe = database(householdId)
      .where("householdId", "==", householdId)
      .onSnapshot(handlePlantSnapshot(householdId));
    return unsubscribe;
  }, [householdId]);

  return null;
};

const handlePlantSnapshot = (householdId: string) => async (
  snapshot: Snapshot
) => {
  const addedOrModified: PlantModel[] = snapshot
    .docChanges()
    .filter(change => ["added", "modified"].includes(change.type))
    .map(change => (change.doc.data() as unknown) as PlantModel);
  const removed: PlantModel[] = snapshot
    .docChanges()
    .filter(change => change.type === "removed")
    .map(change => (change.doc.data() as unknown) as PlantModel);
  addedOrModified.map(upsertPlantByHouseholdId(householdId));
  removed.map(plant => plant.id).map(deletePlantbyHouseholdId(householdId));
};

type Snapshot = firebase.firestore.QuerySnapshot<
  firebase.firestore.DocumentData
>;
