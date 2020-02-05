import stately from "@josephluck/stately";
import useStately from "@josephluck/stately/lib/hooks";
import firebase from "firebase";
import { Profile } from "../../types";
import { createHousehold, subscribeToHouseholds } from "../households/store";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { IErr } from "../../utils/err";
import { pipe } from "fp-ts/lib/pipeable";

const database = () => firebase.firestore().collection("profiles");

interface AuthState {
  initializing: boolean;
  authUser: O.Option<firebase.User>;
  profiles: Record<string, Profile>;
  removeProfilesSubscription: () => void;
}

const store = stately<AuthState>({
  initializing: true,
  authUser: O.none,
  profiles: {},
  removeProfilesSubscription: () => void null
});

/**
 * SUBSCRIPTIONS
 */

/**
 * Subscribe to households for the current user
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
 * Subscribe to profile updates for all profiles currently fetched
 */
store.subscribe((prev, next) => {
  const previousProfileIds = Object.keys(prev.profiles);
  const nextProfileIds = Object.keys(next.profiles);
  const difference = previousProfileIds
    .filter(x => !nextProfileIds.includes(x))
    .concat(nextProfileIds.filter(x => !previousProfileIds.includes(x)));
  if (difference.length) {
    subscribeToProfiles(nextProfileIds);
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

const selectProfileById2 = (id: O.Option<string>) => (
  profiles: Record<string, Profile>
): O.Option<Profile> =>
  pipe(
    id,
    O.map(i => O.fromNullable(profiles[i])),
    O.flatten
  );

const selectProfileById = store.createSelector((s, id: string) =>
  O.fromNullable(s.profiles[id])
);

export const selectCurrentProfile = store.createSelector(
  (s): O.Option<Profile> =>
    pipe(s.profiles, selectProfileById2(selectCurrentProfileId()))
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

const upsertProfile = store.createMutator((s, profile: O.Option<Profile>) => {
  pipe(
    profile,
    O.map(p => {
      s.profiles[p.id] = p;
    })
  );
});

const deleteProfile = store.createMutator((s, profileId: string) => {
  delete s.profiles[profileId];
});

const setInitializing = store.createMutator((s, initializing: boolean) => {
  s.initializing = initializing;
});

const setRemoveProfilesSubscription = store.createMutator(
  (s, removeProfilesSubscription: () => void) => {
    s.removeProfilesSubscription = removeProfilesSubscription;
  }
);

/**
 * EFFECTS
 */

export const initialize = store.createEffect(() => {
  firebase.auth().onAuthStateChanged(async user => {
    setUser(O.fromNullable(user)); // NB: this deals with sign out as well
    if (user) {
      await fetchOrCreateProfile()();
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

export const fetchOrCreateProfile = (): TE.TaskEither<IErr, Profile> =>
  pipe(fetchCurrentProfileIfNotFetched(), TE.orElse(createProfile));

const createProfile = (): TE.TaskEither<IErr, Profile> =>
  pipe(
    selectAuthUser(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(user =>
      TE.tryCatch(
        async () => {
          const profile: Profile = {
            id: user.uid,
            name: "Joseph Luck",
            householdIds: [],
            email: user.email!
          };
          await database()
            .doc(user.uid)
            .set(profile);
          return user.uid;
        },
        () => "BAD_REQUEST" as IErr
      )
    ),
    TE.chain(createHousehold),
    TE.chain(fetchCurrentProfileIfNotFetched)
  );

export const fetchCurrentProfileIfNotFetched = (): TE.TaskEither<
  IErr,
  Profile
> =>
  pipe(
    selectCurrentProfileId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(fetchProfileIfNotFetched)
  );

export const fetchProfileIfNotFetched = (
  id: string
): TE.TaskEither<IErr, Profile> =>
  pipe(
    selectProfileById(id),
    TE.fromOption(() => id),
    TE.orElse(fetchProfile)
  );

export const fetchProfile = (id: string): TE.TaskEither<IErr, Profile> =>
  TE.tryCatch(
    async () => {
      const response = await database()
        .doc(id)
        .get();
      if (!response.exists) {
        throw new Error();
      }
      const profile = response.data() as Profile;
      upsertProfile(O.fromNullable(profile));
      return profile;
    },
    () => "BAD_REQUEST" as IErr
  );

export const addHouseholdToCurrentProfile = (
  householdId: string
): TE.TaskEither<IErr, Profile> =>
  pipe(
    selectCurrentProfileId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(id =>
      TE.tryCatch(
        async () => {
          await database()
            .doc(id)
            .update({
              householdIds: firebase.firestore.FieldValue.arrayUnion(
                householdId
              )
            });
        },
        () => "BAD_REQUEST" as IErr
      )
    ),
    TE.chain(fetchCurrentProfileIfNotFetched)
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
export const removeHouseholdFromProfile = (
  householdId: string
): TE.TaskEither<IErr, Profile> =>
  pipe(
    selectCurrentProfileId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(id =>
      TE.tryCatch(
        async () => {
          await database()
            .doc(id)
            .update({
              householdIds: firebase.firestore.FieldValue.arrayRemove(
                householdId
              )
            });
        },
        () => "BAD_REQUEST" as IErr
      )
    ),
    TE.chain(fetchCurrentProfileIfNotFetched)
  );

export const subscribeToProfiles = store.createEffect(
  async (state, profileIds: string[]) => {
    state.removeProfilesSubscription();
    const subscription = database()
      .where("id", "in", profileIds)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === "added" || change.type === "modified") {
            const profile = (change.doc.data() as unknown) as Profile;
            upsertProfile(O.fromNullable(profile));
          } else if (change.type === "removed") {
            deleteProfile(change.doc.id);
          }
        });
      });
    setRemoveProfilesSubscription(subscription);
  }
);

export const useAuthStore = useStately(store);

// const sleepR = async (duration = 5000) =>
//   new Promise(r => setTimeout(r, duration));
// const sleepL = async (duration = 5000) =>
//   new Promise((_, r) => setTimeout(r, duration));

// const fails = (value: string): TE.TaskEither<IErr, string> =>
//   TE.tryCatch(
//     async () => {
//       console.log("Running fails", value);
//       await sleepL();
//       return "Failed";
//     },
//     () => "BAD_REQUEST" as IErr
//   );

// const initial = (): TE.TaskEither<IErr, string> => TE.right("all good");

// const succeeds = (value: string): TE.TaskEither<IErr, string> =>
//   TE.tryCatch(
//     async () => {
//       console.log("Running succeeds", value);
//       await sleepR();
//       return "Succeeded";
//     },
//     () => "BAD_REQUEST" as IErr
//   );

// const test = (): TE.TaskEither<IErr, string> =>
//   pipe(initial(), TE.chain(succeeds), TE.chain(fails), TE.orElse(succeeds));

// (async () => {
//   await sleepR();
//   console.log("Starting TE: ");
//   test()();
// })();

// https://paulgray.net/the-state-monad/
// import * as A from "fp-ts/lib/Apply";
// const sequenceOption = A.sequenceT(O.option)
// const foo = sequenceOption(selectCurrentProfileId(), selectCurrentProfileEmail())
// const bar = pipe(foo, O.fold(() => null, ([id, email]) => {
//   console.log({id, email})
// }))
