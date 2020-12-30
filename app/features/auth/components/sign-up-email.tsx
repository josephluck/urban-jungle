import { StackScreenProps } from "@react-navigation/stack";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import { View } from "react-native";
import styled from "styled-components/native";

import { IErr } from "@urban-jungle/shared/utils/err";

import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { useAuthMachine } from "../machine/machine";
import { routeNames } from "./route-names";
import { SplashContainer } from "./splash";

const SignUpEmail = ({ navigation }: StackScreenProps<{}>) => {
  const { execute, context } = useAuthMachine();
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{ email: string }>(
    { email: "" },
    { email: [constraints.isRequired, constraints.isString] },
  );

  const handleSignUp = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.map((fields) => {
            execute((ctx) => {
              ctx.emailAddress = fields.email;
            });
          }),
        ),
      ),
    [submit, execute],
  );

  const handleUsePhone = useCallback(() => {
    execute((ctx) => {
      ctx.authType = "phone";
    });
  }, [execute]);

  return (
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <SplashContainer>
        <ScreenTitle
          title="🌱 Urban Jungle"
          description="What's your email address?"
        />

        <TextField
          {...registerTextInput("email")}
          textContentType="emailAddress"
          autoCompleteType="email"
          keyboardType="email-address"
          returnKeyType="send"
          onSubmitEditing={handleSignUp}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View>
          <EmailButton type="plain" onPress={handleUsePhone}>
            {context.authenticationFlow === "signUp"
              ? "Sign up with phone"
              : "Sign in with phone"}
          </EmailButton>

          <Button onPress={handleSignUp} large>
            Next
          </Button>
        </View>
      </SplashContainer>
    </BackableScreenLayout>
  );
};

const EmailButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8};
`;

export const signUpEmailRoute = makeNavigationRoute({
  screen: SignUpEmail,
  routeName: routeNames.signUpEmailRoute,
});
