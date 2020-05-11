import { useEffect } from "react";
import { PhotoModel } from "../../../models/photo";
import firebase from "firebase";
import { photosDatabase } from "../../photos/store/database";
import { upsertPhotos, removePhotos } from "../../photos/store/state";

/**
 * Subscribes to any plant photos for the given household
 */

export const HouseholdPhotosSubscription = ({
  householdId,
}: {
  householdId: string;
}) => {
  useEffect(() => {
    const unsubscribe = photosDatabase(householdId)
      .where("householdId", "==", householdId)
      .onSnapshot(handlePlantPhotoSnapshot(householdId));
    return unsubscribe;
  }, [householdId]);

  return null;
};

const handlePlantPhotoSnapshot = (householdId: string) => async (
  snapshot: Snapshot
) => {
  const addedOrModified: PhotoModel[] = snapshot
    .docChanges()
    .filter((change) => ["added", "modified"].includes(change.type))
    .map((change) => (change.doc.data() as unknown) as PhotoModel);

  const removed: PhotoModel[] = snapshot
    .docChanges()
    .filter((change) => change.type === "removed")
    .map((change) => (change.doc.data() as unknown) as PhotoModel);

  upsertPhotos(householdId, addedOrModified);
  removePhotos(householdId, removed);
};

type Snapshot = firebase.firestore.QuerySnapshot<
  firebase.firestore.DocumentData
>;