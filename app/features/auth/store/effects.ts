import { sequenceSTE } from "@urban-jungle/shared/fp/task-either";
import { ProfileModel } from "@urban-jungle/shared/models/profile";
import { IErr } from "@urban-jungle/shared/utils/err";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { getAndParseInitialHouseholdInvitationDeepLink } from "../../../linking/household-invitation";
import { store } from "../../../store/state";
import {
  createHouseholdForProfile,
  createProfileHouseholdRelation,
  storeSelectedHouseholdIdToStorage,
} from "../../households/store/effects";
import {
  createProfileForUser,
  fetchProfileIfNotFetched,
  syncAuthUserWithProfile,
} from "../../profiles/store/effects";
import { selectCurrentProfileEmail } from "../../profiles/store/state";
import { Context } from "../machine/types";
import {
  selectAuthProviderEmail,
  selectAuthProviderPhone,
  selectAuthUser,
  selectCurrentUserId,
} from "./state";

const authenticateWithEmailAndPassword = (email: string, password: string) =>
  pipe(
    TE.tryCatch(
      async () => firebase.auth().signInWithEmailAndPassword(email, password),
      () => "UNAUTHENTICATED" as IErr,
    ),
    TE.filterOrElse(
      (user) => Boolean(user.user),
      () => "UNAUTHENTICATED" as IErr,
    ),
  );

const authenticateWithPassword = (password: string) =>
  pipe(
    selectCurrentProfileEmail(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((currentEmail) =>
      authenticateWithEmailAndPassword(currentEmail, password),
    ),
  );

const authenticateWithPhone = (
  verificationId: string,
  verificationCode: string,
) =>
  pipe(
    TE.tryCatch(
      () =>
        firebase
          .auth()
          .signInWithCredential(
            firebase.auth.PhoneAuthProvider.credential(
              verificationId,
              verificationCode,
            ),
          ),
      () => "UNAUTHENTICATED" as IErr,
    ),
  );

export const signInWithEmail = (
  email: string,
  password: string,
): TE.TaskEither<IErr, string> =>
  pipe(
    authenticateWithEmailAndPassword(email, password),
    TE.chain((profile) => fetchProfileIfNotFetched(profile.user?.uid!)),
    TE.map((profile) => profile.id),
  );

export const signInWithPhone = (
  verificationId: string,
  verificationCode: string,
): TE.TaskEither<IErr, string> =>
  pipe(
    authenticateWithPhone(verificationId, verificationCode),
    TE.chain((profile) => fetchProfileIfNotFetched(profile.user?.uid!)),
    TE.map((profile) => profile.id),
  );

export const signUpWithEmail = (
  email: string,
  password: string,
): TE.TaskEither<IErr, string> =>
  pipe(
    TE.tryCatch(
      () => firebase.auth().createUserWithEmailAndPassword(email, password),
      () => "BAD_REQUEST" as IErr,
    ),
    TE.chain(validateSignUp),
  );

export const addEmailAndPasswordCredentials = (
  email: string,
  password: string,
) =>
  pipe(
    selectAuthUser(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chainFirst((user) =>
      TE.tryCatch(
        async () =>
          user.linkWithCredential(
            firebase.auth.EmailAuthProvider.credential(email, password),
          ),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.map((user) => user.uid),
    TE.chain(syncAuthUserWithProfile),
  );

export const signUpWithPhone = signInWithPhone;

export const validateSignUp = (
  credentials: firebase.auth.UserCredential,
): TE.TaskEither<IErr, string> =>
  pipe(
    O.fromNullable(credentials.user),
    O.map((user) => user.uid),
    TE.fromOption(() => "BAD_REQUEST"),
  );

export const updateUserPhone = (
  verificationId: string,
  verificationCode: string,
) =>
  pipe(
    selectAuthUser(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chainFirst((user) =>
      TE.tryCatch(
        async () =>
          user.updatePhoneNumber(
            firebase.auth.PhoneAuthProvider.credential(
              verificationId,
              verificationCode,
            ),
          ),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.map((user) => user.uid),
    TE.chain(syncAuthUserWithProfile),
  );

export const updateUserEmail = (currentPassword: string, newEmail: string) =>
  pipe(
    authenticateWithPassword(currentPassword),
    TE.chainFirst((user) =>
      TE.tryCatch(
        async () => user.user!.updateEmail(newEmail),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.map((credential) => credential.user!.uid),
    TE.chain(syncAuthUserWithProfile),
  );

export const updateUserPassword = (
  currentPassword: string,
  newPassword: string,
) =>
  pipe(
    authenticateWithPassword(currentPassword),
    TE.chain((user) =>
      TE.tryCatch(
        async () => user.user!.updatePassword(newPassword),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

const removeAuthProvider = (provider: O.Option<firebase.UserInfo>) =>
  pipe(
    sequenceSTE({
      providerId: pipe(
        provider,
        O.map((provider) => provider.providerId),
        TE.fromOption(() => "NOT_FOUND" as IErr),
      ),
      user: pipe(
        selectAuthUser(),
        TE.fromOption(() => "UNAUTHENTICATED" as IErr),
      ),
    }),
    TE.chain(({ providerId, user }) =>
      TE.tryCatch(
        async () => user.unlink(providerId),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

export const removeEmailAuth = () =>
  pipe(selectAuthProviderEmail(), removeAuthProvider);

export const removePhoneAuth = () =>
  pipe(selectAuthProviderPhone(), removeAuthProvider);

/**
 * Handles creating the relationship between the given profile id and the
 * household if there's a household invitation in the user's initial deep link.
 *
 * Returns the householdId
 */
export const handleInitialHouseholdInvitationLink = (
  profileId: string,
): TE.TaskEither<IErr, string> =>
  pipe(
    getAndParseInitialHouseholdInvitationDeepLink(),
    TE.map((params) => params.householdId),
    TE.chainFirst(createProfileHouseholdRelation(profileId)),
    TE.chain(storeSelectedHouseholdIdToStorage), // TODO: the redirection happens before this is fired
  );

export const signOut = store.createEffect(() => firebase.auth().signOut());

export const fetchOrCreateProfile = (
  signUpContext: Context,
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    fetchCurrentProfileIfNotFetched(),
    TE.orElse(createAndSeedProfile(signUpContext)),
  );

export const fetchCurrentProfileIfNotFetched = (): TE.TaskEither<
  IErr,
  ProfileModel
> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(fetchProfileIfNotFetched),
  );

export const createAndSeedProfile = (
  signUpContext: Context,
) => (): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    selectAuthUser(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(createProfileForUser(signUpContext)),
    TE.map((profile) => profile.id),
    // TODO: check initial deep link, and skip creating a household if there's a householdId in the deep link?
    TE.chain(createHouseholdForProfile()),
    TE.chain(fetchCurrentProfileIfNotFetched),
  );
