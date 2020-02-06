import React from "react";
import { database } from "../store/database";
import {
  selectCurrentProfileId,
  useAuthStore,
  upsertProfiles,
  deleteProfiles
} from "../../auth/store/state";
import { useEffect } from "react";
import { Profile } from "../../../types";
import {
  selectProfileIdsForHouseholds,
  useHouseholdsStore
} from "../../households/store/state";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";

/**
 * Subscribes to current profile and any profiles associated with fetched
 * households.
 *
 * NB: this subscription does not remove profiles that have been removed
 * from a household. This is because this list of profileIds updates which
 * creates a brand new query, thus a "removed" event for the previous
 * query does not run. We could solve this by removing all orphaned
 * from the state once the subscription has finished running.
 */
export const ProfilesSubscription = () => {
  const currentProfileId_ = useAuthStore(selectCurrentProfileId);
  const currentProfileId = pipe(
    currentProfileId_,
    O.getOrElse(() => "")
  );
  const householdProfileIds = useHouseholdsStore(selectProfileIdsForHouseholds);
  const profileIds = [
    ...new Set([currentProfileId, ...householdProfileIds])
  ].filter(Boolean);
  const profileIdsHash = profileIds.join("");

  useEffect(() => {
    if (profileIds.length) {
      const unsubscribe = database()
        .where("id", "in", profileIds)
        .onSnapshot(handleProfileSnapshot);
      return unsubscribe;
    }
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
