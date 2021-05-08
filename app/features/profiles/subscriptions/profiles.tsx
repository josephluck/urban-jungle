import { ProfileModel } from "@urban-jungle/shared/models/profile";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useEffect } from "react";
import { database } from "../../../database";
import { useStore } from "../../../store/state";
import { selectCurrentUserId } from "../../auth/store/state";
import { selectProfileIdsForHouseholds } from "../../households/store/state";
import { deleteProfiles, upsertProfiles } from "../store/state";

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
  const currentProfileId_ = useStore(selectCurrentUserId);
  const currentProfileId = pipe(
    currentProfileId_,
    O.getOrElse(() => ""),
  );
  const householdProfileIds = useStore(selectProfileIdsForHouseholds);
  const profileIds = [
    ...new Set([currentProfileId, ...householdProfileIds]),
  ].filter(Boolean);
  const profileIdsHash = profileIds.join("");

  useEffect(() => {
    if (profileIds.length) {
      const unsubscribe = database.profiles.database
        .where("id", "in", profileIds)
        .onSnapshot(handleProfileSnapshot);
      return unsubscribe;
    }
  }, [profileIdsHash]);

  return <></>;
};

const handleProfileSnapshot = async (snapshot: Snapshot) => {
  const addedOrModified: ProfileModel[] = snapshot
    .docChanges()
    .filter((change) => ["added", "modified"].includes(change.type))
    .map((change) => change.doc.data() as ProfileModel);
  const removed: ProfileModel[] = snapshot
    .docChanges()
    .filter((change) => change.type === "removed")
    .map((change) => change.doc.data() as ProfileModel);
  upsertProfiles(addedOrModified);
  deleteProfiles(removed.map((profile) => profile.id));
};

type Snapshot = firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>;
