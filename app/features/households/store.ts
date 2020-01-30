import uuid from "uuid";
import firebase from "firebase";
import stately from "@josephluck/stately";
import { Household } from "../../types";

const database = () => firebase.firestore().collection("households");

interface HouseholdsState {
  households: Record<string, Household>;
}

const store = stately<HouseholdsState>({
  households: {}
});

export const createHousehold = store.createEffect(
  async (_, profileId: string, household: Partial<Household> = {}) => {
    const {
      id = uuid(),
      name = "Default",
      plants = {},
      profileIds = [profileId]
    } = household;
    const response = await database().add({
      id,
      name,
      plants,
      profileIds
    });
    console.log("createHousehold", { response });
  }
);

// export const addProfileToHousehold = store.createEffect(async (_, profileId: string, householdId: string) => {
//   const household = await database().doc(householdId).get()
//   const response = await database().doc(householdId).update({...household, profileIds: [...household.profileIds, profileId]})
//   return response
// })
