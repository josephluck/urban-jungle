import stately from "@josephluck/stately";
import useStately from "@josephluck/stately/lib/hooks";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { CareModel } from "../models/care";
import { HouseholdModel } from "../models/household";
import {
  CareId,
  HouseholdId,
  PlantId,
  TodoId,
  UserId,
  PhotoId,
} from "../models/ids";
import { PlantModel } from "../models/plant";
import { ProfileModel } from "../models/profile";
import { TodoModel } from "../models/todo";
import { PhotoModel } from "../models/photo";

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
  byHouseholdId: Record<HouseholdId, Record<PlantId, PlantModel>>;
}

interface CaresState {
  byHouseholdId: Record<HouseholdId, Record<CareId, CareModel>>;
}

interface TodosState {
  byHouseholdId: Record<HouseholdId, Record<TodoId, TodoModel>>;
}

interface PhotosState {
  byHouseholdId: Record<HouseholdId, Record<PhotoId, PhotoModel>>;
}

export interface State {
  auth: AuthState;
  profiles: ProfilesState;
  households: HouseholdsState;
  plants: PlantsState;
  cares: CaresState;
  todos: TodosState;
  photos: PhotosState;
  ui: {
    loading: boolean;
  };
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
    byHouseholdId: {},
  },
  cares: {
    byHouseholdId: {},
  },
  todos: {
    byHouseholdId: {},
  },
  photos: {
    byHouseholdId: {},
  },
  ui: {
    loading: false,
  },
};

export const store = stately<State>(defaultState);

export const logGlobalState = store.createEffect(console.log);

export const resetGlobalState = store.createMutator((s) => {
  s = defaultState;
});

// store.subscribe((_, next) => console.log(new Date().toString(), next));

export const useStore = useStately(store);
