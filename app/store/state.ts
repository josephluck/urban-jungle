import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import stately from "@josephluck/stately";
import useStately from "@josephluck/stately/lib/hooks";
import { ProfileModel, HouseholdModel, PlantModel } from "../types";

interface AuthState {
  initializing: boolean;
  authUser: O.Option<firebase.User>;
  profiles: Record<string, ProfileModel>;
  removeProfilesSubscription: () => void;
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
  households: HouseholdsState;
  plants: PlantsState;
}

const defaultState: State = {
  auth: {
    initializing: true,
    authUser: O.none,
    profiles: {},
    removeProfilesSubscription: () => void null
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
