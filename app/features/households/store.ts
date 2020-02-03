import uuid from "uuid";
import firebase from "firebase";
import stately from "@josephluck/stately";
import { Household } from "../../types";
import { IErr } from "../../utils/err";
import { normalizeArrayById } from "../../utils/normalize";
import { Result, Option } from "space-lift";
import makeUseStately from "@josephluck/stately/lib/hooks";
import { addHouseholdToProfile } from "../auth/store";

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

export const removeHousehold = store.createMutator((s, householdId: string) => {
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
            removeHousehold(change.doc.id);
          }
        });
      });
    setRemoveHouseholdsSubscription(subscription);
  }
);

/**
 * Fetches the list of the households that the user belongs to.
 */
export const fetchHouseholds = store.createEffect(
  async (): Promise<Result<IErr, Household[]>> => {
    const response = await database().get();
    const data = response.docs.map(doc => doc.data()) as any;
    const households_ = Option<Household[]>(data);
    households_.map(setHouseholds);
    return households_.toResult(() => "NOT_FOUND");
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
 * Fetches a household.
 */
export const fetchHousehold = store.createEffect(
  async (_, id: string): Promise<Result<IErr, Household>> => {
    const response = await database()
      .doc(id)
      .get();
    const data = (response.data() as any) as Household;
    return Option(data).toResult(() => "NOT_FOUND");
  }
);

/**
 * Adds the given profileId to the household and returns the household.
 */
export const addProfileToHousehold = store.createEffect(
  async (_, profileId: string, householdId: string): Promise<void> => {
    await database()
      .doc(householdId)
      .update({
        profileIds: firebase.firestore.FieldValue.arrayUnion([profileId])
      });
  }
);

export const defaultHousehold: Omit<Household, "id"> = {
  name: "Joseph's Home",
  plants: {},
  profileIds: []
};

export const useHouseholdsStore = makeUseStately(store);
