import { StackScreenProps } from "@react-navigation/stack";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import firebase from "firebase";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import { useRef } from "react";
import { View } from "react-native";
import styled from "styled-components/native";

import { IErr } from "@urban-jungle/shared/utils/err";

import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { env } from "../../../env";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { useMachine } from "../machine/machine";
import { routeNames } from "./route-names";
import { SplashContainer } from "./splash";

const SignUpPhone = ({ navigation }: StackScreenProps<{}>) => {
  const { execute } = useMachine();
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{ phone: string }>(
    { phone: "" },
    { phone: [constraints.isString, constraints.isLengthAtLeast(11)] },
  );

  const handleSignUp = useCallback(async () => {
    runWithUIState(
      pipe(
        TE.fromEither(submit()),
        TE.mapLeft(() => "VALIDATION" as IErr),
        TE.chainFirst((fields) =>
          TE.tryCatch(
            async () => {
              const phoneProvider = new firebase.auth.PhoneAuthProvider();
              const verificationId = await phoneProvider.verifyPhoneNumber(
                fields.phone,
                recaptchaVerifier.current!,
              );
              execute((ctx) => {
                ctx.phoneNumber = fields.phone;
                ctx.verificationId = verificationId;
              });
            },
            (err) => {
              console.log(err);
              return "BAD_REQUEST" as IErr;
            },
          ),
        ),
      ),
    );
  }, [submit, execute, navigation]);

  const handleUseEmail = useCallback(() => {
    execute((ctx) => {
      ctx.authType = "email";
    });
  }, [execute]);

  return (
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
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
            Sign up with email
          </EmailButton>

          <Button onPress={handleSignUp} large>
            Next
          </Button>
        </View>
      </SplashContainer>

      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={env.firebase}
        attemptInvisibleVerification
      />
    </BackableScreenLayout>
  );
};

const EmailButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8};
`;

export const signUpPhoneRoute = makeNavigationRoute({
  screen: SignUpPhone,
  routeName: routeNames.signUpPhoneRoute,
});
