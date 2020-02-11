import firebase from "firebase";
import { pipe } from "fp-ts/lib/pipeable";
import { every } from "../../../fp/option";
import * as O from "fp-ts/lib/Option";
import { store } from "../../../store/state";
import { selectCurrentProfile } from "../../profiles/store/state";

/**
 * SELECTORS
 */

export const selectInitializing = store.createSelector(
  (s): boolean => s.auth.initializing
);

export const selectAuthUser = store.createSelector(
  (s): O.Option<firebase.User> => s.auth.authUser
);

export const selectCurrentUserId = (): O.Option<string> =>
  pipe(
    selectAuthUser(),
    O.map(u => u.uid)
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

export const setInitializing = store.createMutator(
  (s, initializing: boolean) => {
    s.auth.initializing = initializing;
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
// const foo = sequenceOption(selectCurrentUserId(), selectCurrentProfileEmail())
// const bar = pipe(foo, O.fold(() => null, ([id, email]) => {
//   console.log({id, email})
// }))
