import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { every } from "../../../fp/option";
import { store } from "../../../store/state";
import { selectCurrentProfile } from "../../profiles/store/state";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

/**
 * SELECTORS
 */

export const selectInitializing = store.createSelector(
  (s): boolean => s.auth.initializing
);

export const selectAuthUser = store.createSelector(
  (s): O.Option<FirebaseAuthTypes.User> => s.auth.authUser
);

export const selectCurrentUserId = (): O.Option<string> =>
  pipe(
    selectAuthUser(),
    O.map((u) => u.uid)
  );

export const selectHasAuthenticated = (): boolean =>
  every([selectAuthUser(), selectCurrentProfile()]);

/**
 * MUTATORS
 */

export const setUser = store.createMutator(
  (s, authUser: O.Option<FirebaseAuthTypes.User>) => {
    s.auth.authUser = authUser;
  }
);

export const setInitializing = store.createMutator(
  (s, initializing: boolean) => {
    s.auth.initializing = initializing;
  }
);
