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
}

const store = stately<HouseholdsState>({
  households: {}
});

export const defaultHousehold: Omit<Household, "id"> = {
  name: "Joseph's Home",
  plants: {},
  profileIds: []
};

export const selectHouseholds = store.createSelector(s =>
  Object.values(s.households)
);

export const setHouseholds = store.createMutator(
  (s, households: Household[]) =>
    (s.households = { ...s.households, ...normalizeArrayById(households) })
);

// TODO: use subscriptions for list of households for current profile.
// https://firebase.google.com/docs/firestore/query-data/listen#view_changes_between_snapshots

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
  ): Promise<Result<IErr, Household>> => {
    const id = uuid();
    await database()
      .doc(id)
      .set({
        ...defaultHousehold,
        ...household,
        id
      });
    return createHouseholdProfileRelation(profileId, id);
  }
);

/**
 * Creates the relationship between the current user and a household they have
 * created.
 */
export const createHouseholdProfileRelation = store.createEffect(
  async (
    _,
    profileId: string,
    householdId: string
  ): Promise<Result<IErr, Household>> => {
    const [household] = await Promise.all([
      addProfileToHousehold(profileId, householdId),
      addHouseholdToProfile(householdId)
    ]);
    return household;
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
  async (
    _,
    profileId: string,
    householdId: string
  ): Promise<Result<IErr, Household>> => {
    await database()
      .doc(householdId)
      .update({
        profileIds: firebase.firestore.FieldValue.arrayUnion([profileId])
      });
    return fetchHousehold(householdId);
  }
);

export const useHouseholdsStore = makeUseStately(store);
