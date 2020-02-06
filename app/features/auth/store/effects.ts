import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { IErr } from "../../../utils/err";
import { Profile } from "../../../types";
import { pipe } from "fp-ts/lib/pipeable";
import {
  selectAuthUser,
  selectCurrentProfileId,
  selectProfileById,
  selectProfiles,
  store,
  setUser,
  setInitializing,
  upsertProfiles,
  upsertProfile
} from "./state";
import { createHouseholdForProfile } from "../../households/store/effects";
import { database } from "./database";

export const initialize = store.createEffect(() => {
  firebase.auth().onAuthStateChanged(async user => {
    setUser(O.fromNullable(user)); // NB: this deals with sign out as well
    if (user) {
      await fetchOrCreateProfile()();
    } else {
      // TODO: clean up all state...
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

export const signUp = store.createEffect(
  async (_, email: string, password: string) => {
    const response = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    return response;
  }
);

export const signOut = store.createEffect(async () => {
  await firebase.auth().signOut();
});

export const fetchOrCreateProfile = (): TE.TaskEither<IErr, Profile> =>
  pipe(fetchCurrentProfileIfNotFetched(), TE.orElse(createAndSeedProfile));

export const createProfileForUser = (
  user: firebase.User
): TE.TaskEither<IErr, Profile> =>
  TE.tryCatch(
    async () => {
      const profile: Profile = {
        id: user.uid,
        name: "Joseph Luck",
        householdIds: [],
        email: user.email!
      };
      await database()
        .doc(user.uid)
        .set(profile);
      return profile;
    },
    () => "BAD_REQUEST" as IErr
  );

export const fetchCurrentProfileIfNotFetched = (): TE.TaskEither<
  IErr,
  Profile
> =>
  pipe(
    selectCurrentProfileId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(fetchProfileIfNotFetched)
  );

export const fetchProfileIfNotFetched = (
  id: string
): TE.TaskEither<IErr, Profile> =>
  pipe(
    selectProfiles(),
    selectProfileById(O.fromNullable(id)),
    TE.fromOption(() => id),
    TE.orElse(fetchProfile)
  );

export const fetchProfiles = (ids: string[]): TE.TaskEither<IErr, Profile[]> =>
  TE.tryCatch(
    async () => {
      const response = await database()
        .where("id", "in", ids)
        .get();
      if (response.empty) {
        throw new Error();
      }
      const profiles = response.docs.map(doc => doc.data()) as Profile[];
      upsertProfiles(profiles);
      return profiles;
    },
    () => "NOT_FOUND" as IErr
  );

export const fetchProfile = (id: string): TE.TaskEither<IErr, Profile> =>
  TE.tryCatch(
    async () => {
      const response = await database()
        .doc(id)
        .get();
      if (!response.exists) {
        throw new Error();
      }
      const profile = response.data() as Profile;
      upsertProfile(profile);
      return profile;
    },
    () => "NOT_FOUND" as IErr
  );

export const createAndSeedProfile = (): TE.TaskEither<IErr, Profile> =>
  pipe(
    selectAuthUser(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(createProfileForUser),
    TE.map(profile => profile.id),
    TE.chain(createHouseholdForProfile()),
    TE.chain(fetchCurrentProfileIfNotFetched)
  );

export const addHouseholdToCurrentProfile = (
  householdId: string
): TE.TaskEither<IErr, Profile> =>
  pipe(
    selectCurrentProfileId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(id =>
      TE.tryCatch(
        async () => {
          await database()
            .doc(id)
            .update({
              householdIds: firebase.firestore.FieldValue.arrayUnion(
                householdId
              )
            });
        },
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
): TE.TaskEither<IErr, Profile> =>
  pipe(
    selectCurrentProfileId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(id =>
      TE.tryCatch(
        async () => {
          await database()
            .doc(id)
            .update({
              householdIds: firebase.firestore.FieldValue.arrayRemove(
                householdId
              )
            });
        },
        () => "BAD_REQUEST" as IErr
      )
    ),
    TE.chain(fetchCurrentProfileIfNotFetched)
  );
