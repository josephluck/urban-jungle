import { ProfileModel } from "@urban-jungle/shared/models/profile";
import { IErr } from "@urban-jungle/shared/utils/err";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { getAndParseInitialHouseholdInvitationDeepLink } from "../../../linking/household-invitation";
import { resetGlobalState, store } from "../../../store/state";
import {
  createHouseholdForProfile,
  createProfileHouseholdRelation,
  storeSelectedHouseholdIdToStorage,
} from "../../households/store/effects";
import {
  createProfileForUser,
  fetchProfileIfNotFetched,
} from "../../profiles/store/effects";
import {
  selectAuthUser,
  selectCurrentUserId,
  setInitializing,
  setUser,
} from "./state";

export const initialize = store.createEffect(() => {
  firebase.auth().onAuthStateChanged(async (user) => {
    setUser(O.fromNullable(user)); // NB: this deals with sign out as well
    if (user) {
      await fetchOrCreateProfile()();
    } else {
      resetGlobalState();
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

/**
 * Signs up the user.
 * Optionally handles household invitation deep links.
 *
 * Returns the created profileId
 */
export const signUp = (
  email: string,
  password: string
): TE.TaskEither<IErr, string> =>
  pipe(
    TE.tryCatch(
      async () => {
        const response = await firebase
          .auth()
          .createUserWithEmailAndPassword(email, password);
        return response;
      },
      () => "BAD_REQUEST" as IErr
    ),
    TE.chain(validateSignUp),
    TE.chainFirst(handleInitialHouseholdInvitationLink)
  );

/**
 * Validates a user was correctly created
 */
export const validateSignUp = (
  credentials: firebase.auth.UserCredential
): TE.TaskEither<IErr, string> =>
  pipe(
    O.fromNullable(credentials.user),
    O.map((user) => user.uid),
    TE.fromOption(() => "BAD_REQUEST")
  );

/**
 * Handles creating the relationship between the given profile id and the
 * household if there's a household invitation in the user's initial deep link.
 *
 * Returns the householdId
 */
export const handleInitialHouseholdInvitationLink = (
  profileId: string
): TE.TaskEither<IErr, string> =>
  pipe(
    getAndParseInitialHouseholdInvitationDeepLink(),
    TE.map((params) => params.householdId),
    TE.chainFirst(createProfileHouseholdRelation(profileId)),
    TE.chain(storeSelectedHouseholdIdToStorage) // TODO: the redirection happens before this is fired
  );

export const signOut = store.createEffect(async () => {
  await firebase.auth().signOut();
});

export const fetchOrCreateProfile = (): TE.TaskEither<IErr, ProfileModel> =>
  pipe(fetchCurrentProfileIfNotFetched(), TE.orElse(createAndSeedProfile));

export const fetchCurrentProfileIfNotFetched = (): TE.TaskEither<
  IErr,
  ProfileModel
> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(fetchProfileIfNotFetched)
  );

export const createAndSeedProfile = (): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    selectAuthUser(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(createProfileForUser),
    TE.map((profile) => profile.id),
    // TODO: check initial deep link, and skip creating a household if there's a householdId in the deep link?
    TE.chain(createHouseholdForProfile()),
    TE.chain(fetchCurrentProfileIfNotFetched)
  );
