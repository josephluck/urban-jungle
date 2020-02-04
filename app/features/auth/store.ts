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
  authUser: O.Option<firebase.User>;
  profiles: Record<string, Profile>;
}

const store = stately<AuthState>({
  initializing: true,
  authUser: O.none,
  profiles: {}
});

/**
 * SUBSCRIPTIONS
 */

store.subscribe((prev, next) => {
  const prevId = pipe(
    prev.authUser,
    O.map(u => u.uid),
    O.getOrElse(() => "")
  );
  const nextId = pipe(
    next.authUser,
    O.map(u => u.uid),
    O.getOrElse(() => "")
  );
  if (prevId !== nextId && !!nextId) {
    subscribeToHouseholds(nextId);
  }
});

/**
 * SELECTORS
 */

const every = <A extends O.Option<unknown>[]>(options: A): boolean =>
  options.every(O.isSome);

export const selectInitializing = store.createSelector(
  (s): boolean => s.initializing
);

export const selectAuthUser = store.createSelector(
  (s): O.Option<firebase.User> => s.authUser
);

export const selectCurrentProfileId = (): O.Option<string> =>
  pipe(
    selectAuthUser(),
    O.map(u => u.uid)
  );

export const selectCurrentProfileEmail = (): O.Option<string> =>
  pipe(
    selectCurrentProfile(),
    O.map(p => p.email)
  );

const selectProfileById = (id: O.Option<string>) => (
  profiles: Record<string, Profile>
): O.Option<Profile> =>
  pipe(
    id,
    O.map(i => O.fromNullable(profiles[i])),
    O.flatten
  );

export const selectCurrentProfile = store.createSelector(
  (s): O.Option<Profile> =>
    pipe(s.profiles, selectProfileById(selectCurrentProfileId()))
);

export const selectCurrentProfileName = (): O.Option<string> =>
  pipe(
    selectCurrentProfile(),
    O.map(p => p.name)
  );

export const selectHasAuthenticated = (): boolean =>
  every([selectAuthUser(), selectCurrentProfile()]);

/**
 * MUTATORS
 */

const setUser = store.createMutator((s, authUser: O.Option<firebase.User>) => {
  s.authUser = authUser;
});

const setProfile = store.createMutator((s, profile: O.Option<Profile>) => {
  pipe(
    profile,
    O.map(p => {
      s.profiles[p.id] = p;
    })
  );
});

const setInitializing = store.createMutator((s, initializing: boolean) => {
  s.initializing = initializing;
});

/**
 * EFFECTS
 */

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
        const profile = await fetchCurrentProfile();
        return E.isRight(profile) ? profile : await createProfile();
      }
    )(state.authUser)
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
        await Promise.all([createHousehold(user.uid), fetchCurrentProfile()]);
        return E.right(profile);
      }
    )(state.authUser)
);

export const fetchCurrentProfile = store.createEffect(
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
    )(state.authUser)
);

export const addHouseholdToCurrentProfile = store.createEffect(
  async (state, householdId: string): Promise<E.Either<IErr, Profile>> =>
    O.fold<firebase.User, Promise<E.Either<IErr, Profile>>>(
      async () => E.left("UNAUTHENTICATED"),
      async user => {
        await database()
          .doc(user.uid)
          .update({
            householdIds: firebase.firestore.FieldValue.arrayUnion(householdId)
          });
        return fetchCurrentProfile();
      }
    )(state.authUser)
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
        return fetchCurrentProfile();
      }
    )(state.authUser)
);

export const useAuthStore = useStately(store);
