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
} from "../../profiles/store/effects";
import { selectCurrentProfileEmail } from "../../profiles/store/state";
import { Context } from "../machine/types";
import { selectAuthUser, selectCurrentUserId } from "./state";

const authenticateWithEmailAndPassword = (
  currentEmail: string,
  currentPassword: string,
) =>
  pipe(
    TE.tryCatch(
      async () =>
        firebase
          .auth()
          .signInWithEmailAndPassword(currentEmail, currentPassword),
      () => "UNAUTHENTICATED" as IErr,
    ),
    TE.filterOrElse(
      (user) => Boolean(user.user),
      () => "UNAUTHENTICATED" as IErr,
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

export const signUpWithPhone = signInWithPhone;

/**
 * Validates a user was correctly created
 */
export const validateSignUp = (
  credentials: firebase.auth.UserCredential,
): TE.TaskEither<IErr, string> =>
  pipe(
    O.fromNullable(credentials.user),
    O.map((user) => user.uid),
    TE.fromOption(() => "BAD_REQUEST"),
  );

// const getTEUser = () =>
//   pipe(
//     selectAuthUser(),
//     TE.fromOption(() => "UNAUTHENTICATED" as IErr),
//   );
//
// export const updateUserPhone = async (phone: string) =>
//   pipe(
//     getTEUser(),
//     TE.chainFirst((user) =>
//       TE.tryCatch(
//         async () => user.updatePhoneNumber(phone),
//         () => "BAD_REQUEST" as IErr,
//       ),
//     ),
//   );

export const updateUserEmailAndPassword = (
  newEmail: string,
  currentPassword: string,
  newPassword: string,
) =>
  pipe(
    selectCurrentProfileEmail(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((currentEmail) =>
      updateUserEmail(currentEmail, currentPassword, newEmail),
    ),
    TE.chain(() => updateUserPassword(newEmail, currentPassword, newPassword)),
  );

export const updateUserEmail = (
  currentEmail: string,
  currentPassword: string,
  newEmail: string,
) =>
  pipe(
    authenticateWithEmailAndPassword(currentEmail, currentPassword),
    TE.chain((user) =>
      TE.tryCatch(
        async () => user.user!.updateEmail(newEmail),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

export const updateUserPassword = (
  currentEmail: string,
  currentPassword: string,
  newPassword: string,
) =>
  pipe(
    authenticateWithEmailAndPassword(currentEmail, currentPassword),
    TE.chain((user) =>
      TE.tryCatch(
        async () => user.user!.updatePassword(newPassword),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

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
