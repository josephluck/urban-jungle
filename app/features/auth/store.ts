import stately from "@josephluck/stately";
import useStately from "@josephluck/stately/lib/hooks";
import firebase from "firebase";
import { Profile } from "../../types";
import { createHousehold } from "../households/store";
import { Option, Result, Err, Ok, None } from "space-lift";
import { IErr } from "../../utils/err";

const database = () => firebase.firestore().collection("profiles");

interface AuthState {
  initializing: boolean;
  user: Option<firebase.User>;
  profile: Option<Profile>;
}

const store = stately<AuthState>({
  initializing: true,
  user: None,
  profile: None
});

export const selectInitializing = store.createSelector(s => s.initializing);
export const selectUser = store.createSelector(s => s.user);
export const selectProfile = store.createSelector(s => s.profile);
export const selectHasAuthenticated = store.createSelector(s =>
  Option.all([s.user, s.profile]).isDefined()
);

const setUser = store.createMutator(
  (state, user: Option<firebase.User>) => (state.user = user)
);

const setProfile = store.createMutator(
  (state, profile: Option<Profile>) => (state.profile = profile)
);

const setInitializing = store.createMutator(
  (state, initializing: boolean) => (state.initializing = initializing)
);

export const initialize = store.createEffect(() => {
  firebase.auth().onAuthStateChanged(async user => {
    setUser(Option(user)); // NB: this deals with sign out as well
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

export const fetchOrCreateProfile = store.createEffect(
  async (state): Promise<Result<IErr, Profile>> =>
    state.user.fold(
      () => Err("UNAUTHENTICATED"),
      async () => {
        const profile = await fetchProfile();
        return profile.isOk() ? profile : await createProfile();
      }
    )
);

export const createProfile = store.createEffect(
  async (state): Promise<Result<IErr, Profile>> =>
    state.user.fold(
      () => Err("UNAUTHENTICATED"),
      async user => {
        const profile: Profile = {
          id: user.uid,
          name: "Joseph Luck",
          householdIds: [],
          email: user.email!
        };
        await database()
          .doc(user.uid)
          .set(profile);
        await Promise.all([createHousehold(user.uid), fetchProfile()]);
        return Ok(profile);
      }
    )
);

export const fetchProfile = store.createEffect(
  async (state): Promise<Result<IErr, Profile>> =>
    state.user.fold(
      () => Err("UNAUTHENTICATED"),
      async user => {
        const response = await database()
          .doc(user.uid)
          .get();
        const data = (response.data() as any) as Profile;
        const profile = Option(data);
        setProfile(profile);
        return profile.toResult(() => "NOT_FOUND" as const);
      }
    )
);

export const useAuthStore = useStately(store);
