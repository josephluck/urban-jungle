import stately from "@josephluck/stately";
import useStately from "@josephluck/stately/lib/hooks";
import { HouseholdModel } from "@urban-jungle/shared/models/household";
import {
  HouseholdId,
  PhotoId,
  PlantId,
  TodoId,
  UserId,
} from "@urban-jungle/shared/models/ids";
import { PhotoModel } from "@urban-jungle/shared/models/photo";
import { PlantModel } from "@urban-jungle/shared/models/plant";
import { ProfileModel } from "@urban-jungle/shared/models/profile";
import { TodoModel } from "@urban-jungle/shared/models/todo";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import {
  IdentificationResult,
  IdentificationSuggestion,
} from "../features/identify/types";
import { PlantFields } from "../features/plants/store/effects";

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

interface TodosState {
  byHouseholdId: Record<HouseholdId, Record<TodoId, TodoModel>>;
}

interface PhotosState {
  byHouseholdId: Record<HouseholdId, Record<PhotoId, PhotoModel>>;
}

interface NewPlantWorkflowState {
  identificationResult: O.Option<IdentificationResult>;
  selectedIdentificationSuggestion: O.Option<IdentificationSuggestion>;
  plant: Partial<PlantFields>;
}

export interface State {
  auth: AuthState;
  profiles: ProfilesState;
  households: HouseholdsState;
  plants: PlantsState;
  todos: TodosState;
  photos: PhotosState;
  newPlantWorkflow: NewPlantWorkflowState;
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
  todos: {
    byHouseholdId: {},
  },
  photos: {
    byHouseholdId: {},
  },
  newPlantWorkflow: {
    identificationResult: O.none,
    selectedIdentificationSuggestion: O.none,
    plant: {},
  },
  ui: {
    loading: false,
  },
};

export const store = stately<State>(defaultState);

export const logGlobalState = store.createEffect(console.log);

export const resetGlobalState = store.createMutator((s) => {
  console.log(s);
  s = defaultState;
});

// store.subscribe((_, next) => console.log(new Date().toString(), next));

export const useStore = useStately(store);
