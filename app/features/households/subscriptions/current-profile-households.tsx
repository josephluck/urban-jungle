import { database } from "../store/database";
import { selectCurrentProfileId, useAuthStore } from "../../auth/store/state";
import React, { useEffect } from "react";
import * as O from "fp-ts/lib/Option";
import { Household } from "../../../types";
import { removeHouseholdFromProfile } from "../../auth/store/effects";
import { deleteHousehold, upsertHousehold } from "../store/state";
import { pipe } from "fp-ts/lib/pipeable";

/**
 * Subscribes to any households for the current profile ID.
 */
export const CurrentProfileHouseholdsSubscription = () => {
  const profileId_ = useAuthStore(selectCurrentProfileId);
  const profileId = pipe(
    profileId_,
    O.getOrElse(() => "")
  );

  useEffect(() => {
    if (profileId) {
      const unsubscribe = database()
        .where("profileIds", "array-contains", profileId)
        .onSnapshot(handleHouseholdSnapshot);
      return unsubscribe;
    }
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
  addedOrModified.map(upsertHousehold);
  await Promise.all(
    removed.map(household => {
      deleteHousehold(household.id);
      // NB: this works because we do not fetch 3rd degree users' households.
      return removeHouseholdFromProfile(household.id)();
    })
  );
};

type Snapshot = firebase.firestore.QuerySnapshot<
  firebase.firestore.DocumentData
>;
