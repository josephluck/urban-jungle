import { photosDatabase } from "../store/database";
import { useEffect } from "react";
import { PhotoModel } from "../../../models/photo";
import { upsertPlantsPhotos, removePlantsPhotos } from "../store/state";

/**
 * Subscribes to any plants for the given household
 */
export const HouseholdPlantsPhotosSubscription = ({
  householdId,
  plantId,
}: {
  householdId: string;
  plantId: string;
}) => {
  useEffect(() => {
    const unsubscribe = photosDatabase(householdId)(plantId).onSnapshot(
      handlePhotoSnapshot(plantId)
    );
    return unsubscribe;
  }, [householdId, plantId]);

  return null;
};

const handlePhotoSnapshot = (plantId: string) => async (snapshot: Snapshot) => {
  const addedOrModified: PhotoModel[] = snapshot
    .docChanges()
    .filter((change) => ["added", "modified"].includes(change.type))
    .map((change) => (change.doc.data() as unknown) as PhotoModel);

  const removed: PhotoModel[] = snapshot
    .docChanges()
    .filter((change) => change.type === "removed")
    .map((change) => (change.doc.data() as unknown) as PhotoModel);

  upsertPlantsPhotos(plantId, addedOrModified);
  removePlantsPhotos(plantId, removed);
};

type Snapshot = firebase.firestore.QuerySnapshot<
  firebase.firestore.DocumentData
>;
