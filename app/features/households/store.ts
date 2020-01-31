import uuid from "uuid";
import firebase from "firebase";
import stately from "@josephluck/stately";
import { Household } from "../../types";
import { IErr } from "../../utils/err";
import { normalizeArrayById } from "../../utils/normalize";
import { Result, Option } from "space-lift";
import makeUseStately from "@josephluck/stately/lib/hooks";

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
 * Creates a new household. Adds the current user to it.
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
        id,
        profileIds: [profileId]
      });
    return addProfileToHousehold(profileId, id);
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
