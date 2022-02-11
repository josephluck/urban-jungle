import { PhotoModel } from "@urban-jungle/shared/models/photo";
import firebase from "firebase";
import { useEffect } from "react";
import { database } from "../../../database";
import { setFirestoreLoaded } from "../../../store/ui";
import { removePhotos, upsertPhotos } from "../../photos/store/state";

/**
 * Subscribes to any plant photos for the given household
 */

export const HouseholdPhotosSubscription = ({
  householdId,
}: {
  householdId: string;
}) => {
  useEffect(() => {
    const unsubscribe = database.photos
      .database(householdId)
      .where("householdId", "==", householdId)
      .onSnapshot(handlePlantPhotoSnapshot(householdId));
    return unsubscribe;
  }, [householdId]);

  return null;
};

const handlePlantPhotoSnapshot = (householdId: string) => async (
  snapshot: Snapshot,
) => {
  setFirestoreLoaded("plant-photos");
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

type Snapshot = firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>;
