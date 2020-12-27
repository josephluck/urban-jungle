import { StackScreenProps } from "@react-navigation/stack";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";

import { IErr } from "@urban-jungle/shared/utils/err";

import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useRunWithUIState } from "../../../store/ui";
import { useMachine } from "../machine/machine";
import { routeNames } from "./route-names";
import { SplashContainer } from "./splash";
import styled from "styled-components/native";
import { symbols } from "../../../theme";
import { signInWithEmail, signUpWithEmail } from "../store/effects";
import { View } from "react-native";

const SignUpPassword = ({ navigation }: StackScreenProps<{}>) => {
  const { execute, context } = useMachine();
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit, values } = useForm<{ password: string }>(
    { password: "" },
    { password: [constraints.isRequired, constraints.isString] },
  );

  const handleSignUp = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.chain((fields) =>
            context.authenticationFlow === "signIn"
              ? signInWithEmail(context.emailAddress!, fields.password)
              : signUpWithEmail(context.emailAddress!, fields.password),
          ),
          TE.mapLeft(() => {
            execute((ctx) => {
              ctx.password = values.password;
            });
            return "BAD_REQUEST" as IErr;
          }),
        ),
      ),
    [submit, context, execute, values],
  );

  return (
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <SplashContainer>
        <ScreenTitle
          title="🌱 Urban Jungle"
          description={
            context.authenticationFlow === "signUp"
              ? "Please create a password"
              : "Please enter your password"
          }
        />

        <TextField
          {...registerTextInput("password")}
          textContentType="password"
          secureTextEntry
          returnKeyType="send"
          onSubmitEditing={handleSignUp}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View>
          {context.authenticationFlow === "signIn" ? (
            <EmailButton type="plain" onPress={() => console.log("TODO")}>
              I've forgotten my password
            </EmailButton>
          ) : null}

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

export const signUpPasswordRoute = makeNavigationRoute({
  screen: SignUpPassword,
  routeName: routeNames.signUpPasswordRoute,
});
