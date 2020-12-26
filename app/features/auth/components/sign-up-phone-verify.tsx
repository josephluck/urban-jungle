import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import firebase from "firebase";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback, useRef } from "react";
import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { env } from "../../../env";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useRunWithUIState } from "../../../store/ui";
import { useMachine } from "../machine/machine";
import { routeNames } from "./route-names";
import { SplashContainer } from "./splash";

const SignUpPhoneVerify = ({ navigation }: StackScreenProps<{}>) => {
  const {
    execute,
    context: { verificationId, phoneNumber },
  } = useMachine();
  const runWithUIState = useRunWithUIState();
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);

  const { registerTextInput, submit } = useForm<{ verificationCode: string }>(
    { verificationCode: "" },
    {
      verificationCode: [constraints.isString],
    },
  );

  const handleVerify = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.chainFirst((fields) =>
            TE.tryCatch(
              async () => {
                await firebase
                  .auth()
                  .signInWithCredential(
                    firebase.auth.PhoneAuthProvider.credential(
                      verificationId!,
                      fields.verificationCode,
                    ),
                  );
                execute((ctx) => {
                  ctx.verificationCode = fields.verificationCode;
                });
              },
              (err) => {
                console.log(err);
                return "BAD_REQUEST" as IErr;
              },
            ),
          ),
        ),
      ),
    [submit, execute, verificationId],
  );

  return (
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <SplashContainer>
        <ScreenTitle
          title="🌱 Urban Jungle"
          description={`Please enter the code we sent to ${phoneNumber}`}
        />

        <TextField
          {...registerTextInput("verificationCode")}
          returnKeyType="send"
          onSubmitEditing={handleVerify}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button onPress={handleVerify} large>
          Next
        </Button>
      </SplashContainer>

      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={env.firebase}
        attemptInvisibleVerification
      />
    </BackableScreenLayout>
  );
};

export const signUpPhoneVerifyRoute = makeNavigationRoute<{}>({
  screen: SignUpPhoneVerify,
  routeName: routeNames.signUpPhoneVerifyRoute,
});
