import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import firebase from "firebase";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback, useRef } from "react";
import { View } from "react-native";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { AUTH_STACK_NAME } from "../../../navigation/stack-names";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { useAuthMachine } from "../machine/machine";
import { routeNames } from "./route-names";
import { SplashContainer } from "./splash";

const SignUpPhone = ({ navigation }: StackScreenProps<{}>) => {
  const { execute, context } = useAuthMachine();
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{ phone: string }>(
    { phone: "" },
    {
      phone: [constraints.isString, constraints.isLengthAtLeast(11)],
    },
  );

  const handleSignUp = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.chainFirst((fields) =>
            TE.tryCatch(
              async () => {
                const phoneNumber = fields.phone.startsWith("+44")
                  ? fields.phone
                  : `+44${fields.phone.slice(1)}`;
                const phoneProvider = new firebase.auth.PhoneAuthProvider();
                const verificationId = await phoneProvider.verifyPhoneNumber(
                  phoneNumber,
                  recaptchaVerifier.current!,
                );
                execute((ctx) => {
                  ctx.phoneNumber = fields.phone;
                  ctx.verificationId = verificationId;
                });
              },
              () => "BAD_REQUEST" as IErr,
            ),
          ),
        ),
      ),
    [submit, execute, navigation],
  );

  const handleUseEmail = useCallback(() => {
    execute((ctx) => {
      ctx.authType = "email";
    });
  }, [execute]);

  return (
    <ScreenLayout onBack={navigation.goBack} scrollView={false}>
      <SplashContainer>
        <ScreenTitle
          title="🌱 Urban Jungle"
          description="What's your phone number?"
        />

        <TextField
          {...registerTextInput("phone")}
          textContentType="telephoneNumber"
          autoCompleteType="tel"
          keyboardType="phone-pad"
          returnKeyType="send"
          onSubmitEditing={handleSignUp}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View>
          <EmailButton type="plain" onPress={handleUseEmail}>
            {context.authenticationFlow === "signUp"
              ? "Sign up with email"
              : "Sign in with email"}
          </EmailButton>

          <Button onPress={handleSignUp} large>
            Next
          </Button>
        </View>
      </SplashContainer>

      {/* <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={env.firebase}
        attemptInvisibleVerification
      /> */}
    </ScreenLayout>
  );
};

const EmailButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8};
`;

export const signUpPhoneRoute = makeNavigationRoute({
  screen: SignUpPhone,
  stackName: AUTH_STACK_NAME,
  routeName: routeNames.signUpPhoneRoute,
});
