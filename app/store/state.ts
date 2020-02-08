import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import stately from "@josephluck/stately";
import useStately from "@josephluck/stately/lib/hooks";
import { ProfileModel, HouseholdModel, PlantModel } from "../types";

interface AuthState {
  initializing: boolean;
  authUser: O.Option<firebase.User>;
}

interface ProfilesState {
  profiles: Record<string, ProfileModel>;
}

interface HouseholdsState {
  selectedHouseholdId: O.Option<string>;
  households: Record<string, HouseholdModel>;
}

interface PlantsState {
  plantsByHouseholdId: Record<string, Record<string, PlantModel>>;
}

interface State {
  auth: AuthState;
  profiles: ProfilesState;
  households: HouseholdsState;
  plants: PlantsState;
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
  }
};

export const store = stately<State>(defaultState);

export const useStore = useStately(store);
