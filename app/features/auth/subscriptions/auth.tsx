import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useEffect } from "react";

import { resetGlobalState } from "../../../store/state";
import { useRunWithUIState } from "../../../store/ui";
import { useMachine } from "../machine/machine";
import { fetchCurrentProfileIfNotFetched } from "../store/effects";
import { setUser, setInitializing } from "../store/state";

export const AuthenticationSubscription = () => {
  const { execute } = useMachine();
  const runWithUIState = useRunWithUIState();

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      // TODO: TaskEither pipe all of this, with global error handling
      try {
        setUser(O.fromNullable(user));

        if (user) {
          await runWithUIState(
            pipe(
              fetchCurrentProfileIfNotFetched(),
              TE.mapLeft((err) => {
                console.log("Mapping left", { err });
                if (err === "UNAUTHENTICATED" || err === "NOT_FOUND") {
                  // TODO: this navigates too early? The splash screen is still shown...
                  execute((ctx) => {
                    ctx.isAuthenticated = true;
                    ctx.authenticationFlow = "signUp";
                    ctx.authType = "phone"; // TODO: is there a better way to determine the auth type so rehydration works? Maybe store something in the auth user record when the auth happens? There's a user.providerData.providerId === 'phone' that could be used, if email ends up in a different providerId
                    ctx.emailAddress = user.email || ctx.emailAddress;
                    ctx.phoneNumber = user.phoneNumber || ctx.phoneNumber;
                  });
                }
                return err;
              }),
            ),
            false,
          );
        } else {
          execute((ctx) => {
            ctx.isAuthenticated = false;
            ctx.authenticationFlow = "splash";
            ctx.emailAddress = undefined;
            ctx.phoneNumber = undefined;
          });
          resetGlobalState();
        }
      } finally {
        setInitializing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return <></>;
};
