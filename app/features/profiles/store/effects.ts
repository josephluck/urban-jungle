import {
  makeProfileModel,
  ProfileModel,
} from "@urban-jungle/shared/models/profile";
import { IErr } from "@urban-jungle/shared/utils/err";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { database } from "../../../database";
import { fetchCurrentProfileIfNotFetched } from "../../auth/store/effects";
import { selectCurrentUserId } from "../../auth/store/state";
import { selectProfileById, selectProfiles, upsertProfile } from "./state";

export const createProfileForUser = (
  user: firebase.User
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    TE.right(user),
    TE.map((user) =>
      makeProfileModel({
        id: user.uid,
        email: user.email!,
      })
    ),
    TE.chainFirst((profile) =>
      TE.tryCatch(
        () => database.profiles.database.doc(profile.id).set(profile),
        () => "BAD_REQUEST" as IErr
      )
    )
  );

export const fetchProfileIfNotFetched = (
  id: string
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    selectProfiles(),
    selectProfileById(O.fromNullable(id)),
    TE.fromOption(() => id),
    TE.orElse(fetchProfile)
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
    () => "NOT_FOUND" as IErr
  );

export const addHouseholdToCurrentProfile = (
  householdId: string
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((id) =>
      TE.tryCatch(
        () =>
          database.profiles.database.doc(id).update({
            householdIds: firebase.firestore.FieldValue.arrayUnion(householdId),
          }),
        () => "BAD_REQUEST" as IErr
      )
    ),
    TE.chain(fetchCurrentProfileIfNotFetched)
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
  householdId: string
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((id) =>
      TE.tryCatch(
        () =>
          database.profiles.database.doc(id).update({
            householdIds: firebase.firestore.FieldValue.arrayRemove(
              householdId
            ),
          }),
        () => "BAD_REQUEST" as IErr
      )
    ),
    TE.chain(fetchCurrentProfileIfNotFetched)
  );

export const saveExpoPushTokenToProfile = (
  pushToken: string
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
        () => "BAD_REQUEST" as IErr
      )
    )
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
              { merge: true }
            ),
        () => "BAD_REQUEST" as IErr
      )
    )
  );
