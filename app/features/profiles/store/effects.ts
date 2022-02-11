import { sequenceSTE } from "@urban-jungle/shared/fp/task-either";
import {
  makeProfileModel,
  ProfileModel,
  ThemeSetting,
} from "@urban-jungle/shared/models/profile";
import { IErr } from "@urban-jungle/shared/utils/err";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { database } from "../../../database";
import { Context } from "../../auth/machine/types";
import { fetchCurrentProfileIfNotFetched } from "../../auth/store/effects";
import { selectAuthUser, selectCurrentUserId } from "../../auth/store/state";
import {
  selectProfileById,
  selectProfiles,
  setProfileTheme,
  upsertProfile,
} from "./state";

export const createProfileForUser = (signUpContext: Context) => (
  user: firebase.User,
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    TE.right(user),
    TE.map((user) =>
      makeProfileModel({
        id: user.uid,
        email: user.email || signUpContext.emailAddress,
        phoneNumber: user.phoneNumber || signUpContext.phoneNumber,
        name: signUpContext.name,
        avatar: signUpContext.avatar,
      }),
    ),
    TE.chainFirst((profile) =>
      TE.tryCatch(
        () => database.profiles.database.doc(profile.id).set(profile),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

export const syncAuthUserWithProfile = (userId: string) =>
  pipe(
    sequenceSTE({
      user: pipe(
        selectAuthUser(),
        TE.fromOption(() => "UNAUTHENTICATED" as IErr),
      ),
      profile: fetchProfileIfNotFetched(userId),
    }),
    TE.map(({ profile, user }) =>
      makeProfileModel({
        ...profile,
        email: pipe(O.fromNullable(user.email), O.toUndefined),
        phoneNumber: pipe(O.fromNullable(user.phoneNumber), O.toUndefined),
      }),
    ),
  );

export const fetchProfileIfNotFetched = (
  id: string,
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    selectProfiles(),
    selectProfileById(O.fromNullable(id)),
    TE.fromOption(() => id),
    TE.orElse(fetchProfile),
  );

export const fetchProfile = (id: string): TE.TaskEither<IErr, ProfileModel> =>
  TE.tryCatch(
    async () => {
      const response = await database.profiles.database.doc(id).get();
      if (!response.exists) {
        throw new Error();
      }
      const profile = response.data() as ProfileModel;
      upsertProfile(profile);
      return profile;
    },
    () => "NOT_FOUND" as IErr,
  );

export const addHouseholdToCurrentProfile = (
  householdId: string,
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((profileId) =>
      TE.tryCatch(
        () =>
          database.profiles.database.doc(profileId).update({
            householdIds: firebase.firestore.FieldValue.arrayUnion(householdId),
          }),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.chain(fetchCurrentProfileIfNotFetched),
  );

export const updateProfile = (fields: Partial<ProfileModel>) =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(fetchProfileIfNotFetched),
    TE.chainFirst((profile) =>
      TE.tryCatch(
        () =>
          database.profiles.database.doc(profile.id).update({
            ...profile,
            ...fields,
          }),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.map((profile) => profile.id),
    TE.chain(fetchProfile),
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
  householdId: string,
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((id) =>
      TE.tryCatch(
        () =>
          database.profiles.database.doc(id).update({
            householdIds: firebase.firestore.FieldValue.arrayRemove(
              householdId,
            ),
          }),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.chain(fetchCurrentProfileIfNotFetched),
  );

export const saveExpoPushTokenToProfile = (
  pushToken: string,
): TE.TaskEither<IErr, void> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((id) =>
      TE.tryCatch(
        () =>
          database.profiles.database.doc(id).update({
            pushToken,
          }),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

export const saveThemeSettingForProfile = (
  theme: ThemeSetting,
): TE.TaskEither<IErr, void> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chainFirst((userId) => {
      return TE.tryCatch(
        () =>
          database.profiles.database.doc(userId).update({
            theme,
          }),
        () => "BAD_REQUEST" as IErr,
      );
    }),
    TE.map((userId) => {
      setProfileTheme(userId, theme);
    }),
  );

export const removeExpoPushTokenFromProfile = (): TE.TaskEither<IErr, void> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((id) =>
      TE.tryCatch(
        () =>
          database.profiles.database
            .doc(id)
            .set(
              { pushToken: firebase.firestore.FieldValue.delete() },
              { merge: true },
            ),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );
