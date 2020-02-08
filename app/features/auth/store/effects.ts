import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { IErr } from "../../../utils/err";
import { ProfileModel } from "../../../types";
import { pipe } from "fp-ts/lib/pipeable";
import {
  selectAuthUser,
  selectCurrentUserId,
  setUser,
  setInitializing
} from "./state";
import { createHouseholdForProfile } from "../../households/store/effects";
import { store } from "../../../store/state";
import {
  createProfileForUser,
  fetchProfileIfNotFetched
} from "../../profiles/store/effects";

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
    TE.map(profile => profile.id),
    TE.chain(createHouseholdForProfile()),
    TE.chain(fetchCurrentProfileIfNotFetched)
  );
