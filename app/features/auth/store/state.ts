import stately from "@josephluck/stately";
import useStately from "@josephluck/stately/lib/hooks";
import firebase from "firebase";
import { Profile } from "../../../types";
import { pipe } from "fp-ts/lib/pipeable";
import { every } from "../../../fp/option";
import * as O from "fp-ts/lib/Option";

interface AuthState {
  initializing: boolean;
  authUser: O.Option<firebase.User>;
  profiles: Record<string, Profile>;
  removeProfilesSubscription: () => void;
}

export const store = stately<AuthState>({
  initializing: true,
  authUser: O.none,
  profiles: {},
  removeProfilesSubscription: () => void null
});

/**
 * SELECTORS
 */

export const selectInitializing = store.createSelector(
  (s): boolean => s.initializing
);

export const selectAuthUser = store.createSelector(
  (s): O.Option<firebase.User> => s.authUser
);

export const selectProfiles = store.createSelector(
  (s): Record<string, Profile> => s.profiles
);

export const selectCurrentProfile = store.createSelector(
  (s): O.Option<Profile> =>
    pipe(s.profiles, selectProfileById(selectCurrentProfileId()))
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

export const selectProfileById = (id: O.Option<string>) => (
  profiles: Record<string, Profile>
): O.Option<Profile> =>
  pipe(
    id,
    O.map(i => O.fromNullable(profiles[i])),
    O.flatten
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

export const setUser = store.createMutator(
  (s, authUser: O.Option<firebase.User>) => {
    s.authUser = authUser;
  }
);

export const upsertProfile = store.createMutator((s, profile: Profile) => {
  s.profiles[profile.id] = profile;
});

export const upsertProfiles = store.createMutator((s, profiles: Profile[]) => {
  profiles.forEach(profile => {
    s.profiles[profile.id] = profile;
  });
});

export const deleteProfiles = store.createMutator((s, profileIds: string[]) => {
  profileIds.forEach(id => {
    delete s.profiles[id];
  });
});

export const setInitializing = store.createMutator(
  (s, initializing: boolean) => {
    s.initializing = initializing;
  }
);

export const setRemoveProfilesSubscription = store.createMutator(
  (s, removeProfilesSubscription: () => void) => {
    s.removeProfilesSubscription = removeProfilesSubscription;
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
