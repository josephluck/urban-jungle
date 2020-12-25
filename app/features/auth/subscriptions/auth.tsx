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
                if (err === "UNAUTHENTICATED" || err === "NOT_FOUND") {
                  const phoneProvider = user.providerData.find(
                    (provider) => provider?.providerId === "phone",
                  );
                  execute((ctx) => {
                    ctx.isAuthenticated = true;
                    ctx.authenticationFlow = "signUp";
                    ctx.authType = phoneProvider ? "phone" : "email";
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
