import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import stately from "@josephluck/stately";
import useStately from "@josephluck/stately/lib/hooks";
import {
  ProfileModel,
  HouseholdModel,
  PlantModel,
  CareModel,
  UserId,
  HouseholdId,
  PlantId,
  CareId
} from "../types";

interface AuthState {
  initializing: boolean;
  authUser: O.Option<firebase.User>;
}

interface ProfilesState {
  profiles: Record<UserId, ProfileModel>;
}

interface HouseholdsState {
  selectedHouseholdId: O.Option<HouseholdId>;
  households: Record<HouseholdId, HouseholdModel>;
}

interface PlantsState {
  plantsByHouseholdId: Record<HouseholdId, Record<PlantId, PlantModel>>;
}

interface CaresState {
  caresByHouseholdId: Record<HouseholdId, Record<CareId, CareModel>>;
}

interface State {
  auth: AuthState;
  profiles: ProfilesState;
  households: HouseholdsState;
  plants: PlantsState;
  cares: CaresState;
}

const defaultState: State = {
  auth: {
    initializing: true,
    authUser: O.none
  },
  profiles: {
    profiles: {}
  },
  households: {
    selectedHouseholdId: O.none,
    households: {}
  },
  plants: {
    plantsByHouseholdId: {}
  },
  cares: {
    caresByHouseholdId: {}
  }
};

export const store = stately<State>(defaultState);

export const resetGlobalState = store.createMutator(s => {
  s = defaultState;
});

store.subscribe((_, next) => console.log(new Date().toString(), next));

export const useStore = useStately(store);
