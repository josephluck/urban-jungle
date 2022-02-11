import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useEffect } from "react";
import { fetchCurrentProfileIfNotFetched } from "../../../store/effects";
import { setInitializing, setUser } from "../../../store/selectors";
import { resetGlobalState } from "../../../store/state";
import { setFirestoreLoaded, useRunWithUIState } from "../../../store/ui";
import { useAuthMachine } from "../machine/machine";

export const AuthenticationSubscription = () => {
  const { execute } = useAuthMachine();
  const runWithUIState = useRunWithUIState();

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      setFirestoreLoaded("auth");
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
