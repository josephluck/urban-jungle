import stately from "@josephluck/stately";
import useStately from "@josephluck/stately/lib/hooks";
import firebase from "firebase";
import { Profile } from "../../types";

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

export const selectUser = store.createSelector(s => s.user);
export const selectInitializing = store.createSelector(s => s.initializing);

const setUser = store.createMutator(
  (state, user: firebase.User) => (state.user = user)
);
const setInitializing = store.createMutator(
  (state, initializing: boolean) => (state.initializing = initializing)
);

export const initialize = store.createEffect(() => {
  firebase.auth().onAuthStateChanged(user => {
    setUser(user);
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

export const useAuthStore = useStately(store);
