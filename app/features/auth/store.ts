import stately from "@josephluck/stately";
import useStately from "@josephluck/stately/lib/hooks";
import firebase from "firebase";
import { Profile } from "../../types";
import { createHousehold } from "../households/store";
import { Option } from "space-lift";

const database = () => firebase.firestore().collection("profiles");

interface AuthState {
  initializing: boolean;
  user: firebase.User | null;
  profile: Profile | null;
}

const store = stately<AuthState>({
  initializing: true,
  user: null,
  profile: null
});

export const selectInitializing = store.createSelector(s => s.initializing);
export const selectUser = store.createSelector(s => s.user);
export const selectProfile = store.createSelector(s => s.profile);

const setUser = store.createMutator(
  (state, user: firebase.User) => (state.user = user)
);

const setProfile = store.createMutator(
  (state, profile: Profile) => (state.profile = profile)
);

const setInitializing = store.createMutator(
  (state, initializing: boolean) => (state.initializing = initializing)
);

export const initialize = store.createEffect(() => {
  firebase.auth().onAuthStateChanged(async user => {
    setUser(user); // NB: this deals with sign out as well
    if (user) {
      await fetchOrCreateProfile();
    }
    setInitializing(false);
  });
});

export const signIn = store.createEffect(
  async (_, email: string, password: string) => {
    const response = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    return response;
  }
);

export const signUp = store.createEffect(
  async (_, email: string, password: string) => {
    const response = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    return response;
  }
);

export const signOut = store.createEffect(async () => {
  await firebase.auth().signOut();
});

export const fetchOrCreateProfile = store.createEffect(async state => {
  if (state.user && state.user.uid) {
    const profile = await fetchProfile();
    return profile.isDefined() ? profile.get() : await createProfile();
  } else {
    console.error('Cannot fetch or create profile - User is not authenticated')
  }
});

export const createProfile = store.createEffect(async state => {
  const profile: Profile = {
    id: state.user.uid,
    name: "Joseph Luck",
    householdIds: [],
    email: state.user.email
  };
  await database()
    .doc(state.user.uid)
    .set(profile);
  await Promise.all([createHousehold(state.user.uid), fetchProfile()]);
  return profile;
});

export const fetchProfile = store.createEffect(
  async (state): Promise<Option<Profile>> => {
    const response = await database()
      .doc(state.user.uid)
      .get();
    const profile = Option((response.data() as unknown) as Profile);
    profile.map(setProfile);
    return profile;
  }
);

export const useAuthStore = useStately(store);
