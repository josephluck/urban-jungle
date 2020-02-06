import { database } from "../store/database";
import { selectCurrentProfileId, useAuthStore } from "../../auth/store/state";
import { useEffect } from "react";
import { Household } from "../../../types";
import {
  fetchProfiles,
  removeHouseholdFromProfile
} from "../../auth/store/effects";
import { deleteHousehold } from "../store/state";

/**
 * Subscribes to any households for the current profile ID.
 */
export const CurrentProfileHouseholdsSubscription = () => {
  const profileId = useAuthStore(selectCurrentProfileId);

  useEffect(() => {
    console.log("Setting up households subscription for profile: ", {
      profileId
    });
    const unsubscribe = database()
      .where("profileIds", "array-contains", profileId)
      .onSnapshot(handleHouseholdSnapshot);
    return () => {
      unsubscribe();
    };
  }, [profileId]);

  return <></>;
};

const handleHouseholdSnapshot = async (snapshot: Snapshot) => {
  const addedOrModified: Household[] = snapshot
    .docChanges()
    .filter(change => ["added", "modified"].includes(change.type))
    .map(change => (change.doc.data() as unknown) as Household);
  const removed: Household[] = snapshot
    .docChanges()
    .filter(change => change.type === "removed")
    .map(change => (change.doc.data() as unknown) as Household);
  const profileIds = addedOrModified
    .map(household => household.profileIds)
    .reduce((prev, arr) => [...prev, ...arr], []);
  const profileFetches = fetchProfiles(profileIds);
  const householdRemovals = removed.map(household => {
    deleteHousehold(household.id);
    return removeHouseholdFromProfile(household.id)();
  });
  await Promise.all([profileFetches, householdRemovals]);
};

type Snapshot = firebase.firestore.QuerySnapshot<
  firebase.firestore.DocumentData
>;
