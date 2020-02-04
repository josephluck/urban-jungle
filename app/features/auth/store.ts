import stately from "@josephluck/stately";
import useStately from "@josephluck/stately/lib/hooks";
import firebase from "firebase";
import { Profile } from "../../types";
import { createHousehold, subscribeToHouseholds } from "../households/store";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { IErr } from "../../utils/err";
import { pipe } from "fp-ts/lib/pipeable";

const database = () => firebase.firestore().collection("profiles");

interface AuthState {
  initializing: boolean;
  user: O.Option<firebase.User>;
  profile: O.Option<Profile>;
}

const store = stately<AuthState>({
  initializing: true,
  user: O.none,
  profile: O.none
});

const extractProfileId = (profile: Profile) => profile.id;

store.subscribe((prev, next) => {
  const prevId = pipe(
    prev.profile,
    O.map(extractProfileId),
    O.getOrElse(() => "")
  );
  const nextId = pipe(
    next.profile,
    O.map(extractProfileId),
    O.getOrElse(() => "")
  );
  if (prevId !== nextId && !!nextId) {
    subscribeToHouseholds(nextId);
  }
});

const every = <A extends O.Option<unknown>[]>(options: A) =>
  options.every(O.isSome);

export const selectInitializing = store.createSelector(s => s.initializing);
export const selectUser = store.createSelector(s => s.user);
export const selectUserEmail = store.createSelector(s =>
  pipe(
    s.user,
    O.map(u => O.fromNullable(u.email)),
    O.flatten
  )
);
export const selectUserName = store.createSelector(s =>
  pipe(
    s.profile,
    O.map(p => p.name)
  )
);
export const selectProfile = store.createSelector(s => s.profile);
export const selectProfileId = store.createSelector(s =>
  pipe(
    s.profile,
    O.map(p => p.id)
  )
);
export const selectHasAuthenticated = store.createSelector(s =>
  every([s.user, s.profile])
);

const setUser = store.createMutator(
  (state, user: O.Option<firebase.User>) => (state.user = user)
);

const setProfile = store.createMutator(
  (state, profile: O.Option<Profile>) => (state.profile = profile)
);

const setInitializing = store.createMutator(
  (state, initializing: boolean) => (state.initializing = initializing)
);

export const initialize = store.createEffect(() => {
  firebase.auth().onAuthStateChanged(async user => {
    setUser(O.fromNullable(user)); // NB: this deals with sign out as well
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
  async (state): Promise<E.Either<IErr, Profile>> =>
    O.fold<firebase.User, Promise<E.Either<IErr, Profile>>>(
      async () => E.left("UNAUTHENTICATED"),
      async () => {
        const profile = await fetchProfile();
        return E.isRight(profile) ? profile : await createProfile();
      }
    )(state.user)
);

export const createProfile = store.createEffect(
  async (state): Promise<E.Either<IErr, Profile>> =>
    O.fold<firebase.User, Promise<E.Either<IErr, Profile>>>(
      async () => E.left("UNAUTHENTICATED"),
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
        return E.right(profile);
      }
    )(state.user)
);

export const fetchProfile = store.createEffect(
  async (state): Promise<E.Either<IErr, Profile>> =>
    O.fold<firebase.User, Promise<E.Either<IErr, Profile>>>(
      async () => E.left("UNAUTHENTICATED"),
      async user => {
        const response = await database()
          .doc(user.uid)
          .get();
        const data = response.data() as any;
        const profile = O.fromNullable<Profile>(data);
        setProfile(profile);
        return E.fromOption<IErr>(() => "NOT_FOUND")(profile);
      }
    )(state.user)
);

export const addHouseholdToProfile = store.createEffect(
  async (state, householdId: string): Promise<E.Either<IErr, Profile>> =>
    O.fold<firebase.User, Promise<E.Either<IErr, Profile>>>(
      async () => E.left("UNAUTHENTICATED"),
      async user => {
        await database()
          .doc(user.uid)
          .update({
            householdIds: firebase.firestore.FieldValue.arrayUnion(householdId)
          });
        return fetchProfile();
      }
    )(state.user)
);

/**
 * Removes a household from the profile.
 *
 * TODO: when a household is deleted, it will not remove the household ids from
 * all profiles the household. If there are multiple profiles associated with
 * a household, the household should probably not be deleted and only the
 * association between the current user and the household should be removed.
 * At the moment, the household is deleted, but there can still be stray
 * profiles associated to it.
 */
export const removeHouseholdFromProfile = store.createEffect(
  async (state, householdId: string): Promise<E.Either<IErr, Profile>> =>
    O.fold<firebase.User, Promise<E.Either<IErr, Profile>>>(
      async () => E.left("UNAUTHENTICATED"),
      async user => {
        await database()
          .doc(user.uid)
          .update({
            householdIds: firebase.firestore.FieldValue.arrayRemove(householdId)
          });
        return fetchProfile();
      }
    )(state.user)
);

export const useAuthStore = useStately(store);
