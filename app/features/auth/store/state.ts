import { sequenceSO, sequenceTO } from "@urban-jungle/shared/fp/option";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { store } from "../../../store/state";
import { AuthProvider, ManageAuthContext } from "../../manage/machine/types";
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

export const selectAuthProviders = () =>
  pipe(
    selectAuthUser(),
    O.map((user) => user.providerData),
  );

export const selectAuthProviderPhone = () =>
  pipe(
    selectAuthProviders(),
    O.filterMap((providers) =>
      O.fromNullable(providers.find((p) => p?.providerId === "phone")),
    ),
  );

export const selectAuthProviderEmail = () =>
  pipe(
    selectAuthProviders(),
    O.filterMap((providers) =>
      O.fromNullable(providers.find((p) => p?.providerId === "password")),
    ),
  );

export const selectHasMultipleAuthProviders = () =>
  pipe(
    selectAuthProviders(),
    O.map((providers) => providers.filter(Boolean)),
    O.filter((providers) => providers.length > 0),
    O.isSome,
  );

const selectAuthProvidersForMachine = (): O.Option<AuthProvider[]> => {
  const authProviderEmail = selectAuthProviderEmail();
  const authProviderPhone = selectAuthProviderPhone();

  if (O.isSome(authProviderEmail) && O.isSome(authProviderPhone)) {
    return O.some(["EMAIL", "PHONE"]);
  }

  if (O.isSome(authProviderPhone)) {
    return O.some(["PHONE"]);
  }

  if (O.isSome(authProviderEmail)) {
    return O.some(["EMAIL"]);
  }

  return O.none;
};

export const selectManageAuthInitialContext = (): Partial<ManageAuthContext> =>
  pipe(
    sequenceSO({
      profile: selectCurrentProfile(),
      authProviders: selectAuthProvidersForMachine(),
    }),
    O.map(
      ({ profile, authProviders }): Partial<ManageAuthContext> => {
        console.log({ profile, authProviders });
        return {
          currentEmailAddress: profile.email,
          currentPhoneNumber: profile.phoneNumber,
          currentAuthProviders: authProviders,
        };
      },
    ),
    O.getOrElse(() => ({})),
  );

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
