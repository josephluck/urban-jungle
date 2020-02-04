import uuid from "uuid";
import firebase from "firebase";
import stately from "@josephluck/stately";
import { Household } from "../../types";
import { IErr } from "../../utils/err";
import * as E from "fp-ts/lib/Either";
import { normalizeArrayById } from "../../utils/normalize";
import makeUseStately from "@josephluck/stately/lib/hooks";
import {
  addHouseholdToProfile,
  removeHouseholdFromProfile
} from "../auth/store";

const database = () => firebase.firestore().collection("households");

interface HouseholdsState {
  households: Record<string, Household>;
  removeHouseholdsSubscription: () => void;
}

const store = stately<HouseholdsState>({
  households: {},
  removeHouseholdsSubscription: () => null
});

export const selectHouseholds = store.createSelector(s =>
  Object.values(s.households)
);

export const setRemoveHouseholdsSubscription = store.createMutator(
  (s, subscription) => {
    s.removeHouseholdsSubscription = subscription;
  }
);

export const setHouseholds = store.createMutator(
  (s, households: Household[]) => {
    s.households = { ...s.households, ...normalizeArrayById(households) };
  }
);

export const upsertHousehold = store.createMutator(
  (s, household: Household) => {
    s.households[household.id] = household;
  }
);

export const deleteHousehold = store.createMutator((s, householdId: string) => {
  delete s.households[householdId];
});

export const subscribeToHouseholds = store.createEffect(
  async (state, profileId: string) => {
    state.removeHouseholdsSubscription();
    const subscription = database()
      .where("profileIds", "array-contains", profileId)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === "added" || change.type === "modified") {
            upsertHousehold((change.doc.data() as unknown) as Household);
          } else if (change.type === "removed") {
            /**
             * TODO: should probably only delete the household if the profile
             * is the only profile associated with the household, to prevent
             * the deletion of a household affecting other members.
             */
            deleteHousehold(change.doc.id);
            removeHouseholdFromProfile(change.doc.id);
          }
        });
      });
    setRemoveHouseholdsSubscription(subscription);
  }
);

/**
 * Creates a new household. Subsequently adds the current user relation to it.
 */
export const createHousehold = store.createEffect(
  async (
    _,
    profileId: string,
    household: Omit<Household, "id"> = defaultHousehold
  ): Promise<void> => {
    const id = uuid();
    await database()
      .doc(id)
      .set({
        ...defaultHousehold,
        ...household,
        id
      });
    await createHouseholdProfileRelation(profileId, id);
  }
);

/**
 * Creates the relationship between the current user and a household they have
 * created.
 */
export const createHouseholdProfileRelation = store.createEffect(
  async (_, profileId: string, householdId: string): Promise<void> => {
    await Promise.all([
      addProfileToHousehold(profileId, householdId),
      addHouseholdToProfile(householdId)
    ]);
  }
);

/**
 * Adds the given profileId to the household and returns the household.
 */
export const addProfileToHousehold = store.createEffect(
  async (_, profileId: string, householdId: string): Promise<void> =>
    await database()
      .doc(householdId)
      .update({
        profileIds: firebase.firestore.FieldValue.arrayUnion(profileId)
      })
);

/**
 * Removes a household.
 */
export const removeHousehold = store.createEffect(
  async (_, id: string): Promise<E.Either<IErr, void>> => {
    try {
      await database()
        .doc(id)
        .delete();
      return E.right(void null);
    } catch (err) {
      return E.left("NOT_FOUND");
    }
  }
);

export const defaultHousehold: Omit<Household, "id"> = {
  name: "Joseph's Home",
  plants: {},
  profileIds: []
};

export const useHouseholdsStore = makeUseStately(store);
