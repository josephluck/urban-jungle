import firebase from "firebase";
import { ProfileModel } from "../../../types";
import { pipe } from "fp-ts/lib/pipeable";
import { every } from "../../../fp/option";
import * as O from "fp-ts/lib/Option";
import { store } from "../../../store/state";


/**
 * SELECTORS
 */

export const selectInitializing = store.createSelector(
  (s): boolean => s.auth.initializing
);

export const selectAuthUser = store.createSelector(
  (s): O.Option<firebase.User> => s.auth.authUser
);

export const selectProfiles = store.createSelector(
  (s): Record<string, ProfileModel> => s.auth.profiles
);

export const selectCurrentProfile = store.createSelector(
  (s): O.Option<ProfileModel> =>
    pipe(s.auth.profiles, selectProfileById(selectCurrentProfileId()))
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

export const selectCurrentProfileAvatar = (): O.Option<string> =>
  pipe(
    selectCurrentProfile(),
    O.map(p => O.fromNullable(p.avatar)),
    O.flatten
  );

export const selectCurrentProfileName = (): O.Option<string> =>
  pipe(
    selectCurrentProfile(),
    O.map(p => p.name)
  );

export const selectProfileById = (id: O.Option<string>) => (
  profiles: Record<string, ProfileModel>
): O.Option<ProfileModel> =>
  pipe(
    id,
    O.map(i => O.fromNullable(profiles[i])),
    O.flatten
  );

export const selectProfileById2 = (id: string): O.Option<ProfileModel> =>
  O.fromNullable(selectProfiles()[id]);

export const selectProfileAvatarById = (id: string): O.Option<string> =>
  pipe(
    selectProfileById2(id),
    O.chain(profile => O.fromNullable(profile.avatar))
  );

export const selectHasAuthenticated = (): boolean =>
  every([selectAuthUser(), selectCurrentProfile()]);

/**
 * MUTATORS
 */

export const setUser = store.createMutator(
  (s, authUser: O.Option<firebase.User>) => {
    s.auth.authUser = authUser;
  }
);

export const upsertProfile = store.createMutator((s, profile: ProfileModel) => {
  s.auth.profiles[profile.id] = profile;
});

export const upsertProfiles = store.createMutator(
  (s, profiles: ProfileModel[]) => {
    profiles.forEach(profile => {
      s.auth.profiles[profile.id] = profile;
    });
  }
);

export const deleteProfiles = store.createMutator((s, profileIds: string[]) => {
  profileIds.forEach(id => {
    delete s.auth.profiles[id];
  });
});

export const setInitializing = store.createMutator(
  (s, initializing: boolean) => {
    s.auth.initializing = initializing;
  }
);

export const setRemoveProfilesSubscription = store.createMutator(
  (s, removeProfilesSubscription: () => void) => {
    s.auth.removeProfilesSubscription = removeProfilesSubscription;
  }
);

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
