import { database } from "../store/database";
import {
  selectCurrentProfileId,
  useAuthStore,
  upsertProfiles,
  deleteProfiles
} from "../../auth/store/state";
import { useEffect } from "react";
import { Profile } from "../../../types";
import { selectProfileIdsForHouseholds } from "../../households/store/state";

/**
 * Subscribes to current profile and any profiles associated with fetched
 * households.
 */
export const ProfilesSubscription = () => {
  const currentProfileId = useAuthStore(selectCurrentProfileId);
  const householdProfileIds = useAuthStore(selectProfileIdsForHouseholds);
  const profileIds = [currentProfileId, ...householdProfileIds];
  const profileIdsHash = profileIds.join("");

  useEffect(() => {
    console.log("Setting up profiles subscription for profiles: ", {
      profileIds
    });
    const unsubscribe = database()
      .where("id", "in", profileIds)
      .onSnapshot(handleProfileSnapshot);
    return unsubscribe;
  }, [profileIdsHash]);

  return <></>;
};

const handleProfileSnapshot = async (snapshot: Snapshot) => {
  const addedOrModified: Profile[] = snapshot
    .docChanges()
    .filter(change => ["added", "modified"].includes(change.type))
    .map(change => change.doc.data() as Profile);
  const removed: Profile[] = snapshot
    .docChanges()
    .filter(change => change.type === "removed")
    .map(change => change.doc.data() as Profile);
  upsertProfiles(addedOrModified);
  deleteProfiles(removed.map(profile => profile.id));
};

type Snapshot = firebase.firestore.QuerySnapshot<
  firebase.firestore.DocumentData
>;
