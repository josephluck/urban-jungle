import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";

import { sequenceTO } from "@urban-jungle/shared/fp/option";

import { store } from "../../../store/state";
import { selectCurrentProfile } from "../../profiles/store/state";

/**
 * SELECTORS
 */

export const selectInitializing = store.createSelector(
  (s): boolean => s.auth.initializing,
);

export const selectAuthUser = store.createSelector(
  (s): O.Option<firebase.User> => s.auth.authUser,
);

export const selectCurrentUserId = (): O.Option<string> =>
  pipe(
    selectAuthUser(),
    O.map((u) => u.uid),
  );

export const selectHasAuthenticated = (): boolean =>
  pipe(sequenceTO(selectAuthUser(), selectCurrentProfile()), O.isSome);

/**
 * MUTATORS
 */

export const setUser = store.createMutator(
  (s, authUser: O.Option<firebase.User>) => {
    s.auth.authUser = authUser;
  },
);

export const setInitializing = store.createMutator(
  (s, initializing: boolean) => {
    s.auth.initializing = initializing;
  },
);
