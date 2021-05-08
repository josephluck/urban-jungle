import { HouseholdModel } from "@urban-jungle/shared/models/household";
import { IErr } from "@urban-jungle/shared/utils/err";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useEffect } from "react";
import { database } from "../../../database";
import { useStore } from "../../../store/state";
import { selectCurrentUserId } from "../../auth/store/state";
import { removeHouseholdFromProfile } from "../../profiles/store/effects";
import { storeSelectedHouseholdIdToStorageIfNotPresent } from "../store/effects";
import { deleteHousehold, upsertHousehold } from "../store/state";

/**
 * Subscribes to any households for the current profile ID.
 */
export const CurrentProfileHouseholdsSubscription = () => {
  const profileId_ = useStore(selectCurrentUserId);
  const profileId = pipe(
    profileId_,
    O.getOrElse(() => ""),
  );

  useEffect(() => {
    if (profileId) {
      const unsubscribe = database.households.database
        .where("profileIds", "array-contains", profileId)
        .onSnapshot(handleHouseholdSnapshot);
      return unsubscribe;
    }
  }, [profileId]);

  return <></>;
};

const handleHouseholdSnapshot = async (snapshot: Snapshot) => {
  const addedOrModified: HouseholdModel[] = snapshot
    .docChanges()
    .filter((change) => ["added", "modified"].includes(change.type))
    .map((change) => (change.doc.data() as unknown) as HouseholdModel);
  const removed: HouseholdModel[] = snapshot
    .docChanges()
    .filter((change) => change.type === "removed")
    .map((change) => (change.doc.data() as unknown) as HouseholdModel);
  addedOrModified.map(upsertHousehold);

  // NB: if there isn't a selected householdId in AsyncStorage yet and there are
  // households associated with the user, store the first household's ID as the
  // user's selected household.
  const storeSelectedHouseholdIdIfNeeded = pipe(
    O.fromNullable(addedOrModified[0]),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.map((household) => household.id),
    TE.chain(storeSelectedHouseholdIdToStorageIfNotPresent),
  );
  await storeSelectedHouseholdIdIfNeeded();

  await Promise.all(
    removed.map((household) => {
      deleteHousehold(household.id);
      // NB: this works because we do not fetch 3rd degree users' households.
      return removeHouseholdFromProfile(household.id)();
    }),
  );
};

type Snapshot = firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>;
