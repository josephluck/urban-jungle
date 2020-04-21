import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import stately from "@josephluck/stately";
import useStately from "@josephluck/stately/lib/hooks";
import { CareModel } from "../models/care";
import { TodoModel } from "../models/todo";
import { UserId, HouseholdId, PlantId, CareId, TodoId } from "../models/ids";
import { ProfileModel } from "../models/profile";
import { HouseholdModel } from "../models/household";
import { PlantModel } from "../models/plant";

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

interface TodosState {
  todosByHouseholdId: Record<HouseholdId, Record<TodoId, TodoModel>>;
}

interface State {
  auth: AuthState;
  profiles: ProfilesState;
  households: HouseholdsState;
  plants: PlantsState;
  cares: CaresState;
  todos: TodosState;
}

export const defaultState: State = {
  auth: {
    initializing: true,
    authUser: O.none,
  },
  profiles: {
    profiles: {},
  },
  households: {
    selectedHouseholdId: O.none,
    households: {},
  },
  plants: {
    plantsByHouseholdId: {},
  },
  cares: {
    caresByHouseholdId: {},
  },
  todos: {
    todosByHouseholdId: {},
  },
};

export const store = stately<State>(defaultState);

export const resetGlobalState = store.createMutator((s) => {
  s = defaultState;
});

// store.subscribe((_, next) => console.log(new Date().toString(), next));

export const useStore = useStately(store);
