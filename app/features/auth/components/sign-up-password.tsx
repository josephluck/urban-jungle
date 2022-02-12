import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import {
  Footer,
  ScreenLayout,
} from "../../../components/layouts/screen-layout";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { AUTH_STACK_NAME } from "../../../navigation/stack-names";
import {
  sendForgottenPasswordEmail,
  signInWithEmail,
  signUpWithEmail,
} from "../../../store/effects";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { useAuthMachine } from "../machine/machine";
import { routeNames } from "./route-names";
import { SplashContainer } from "./splash";

const SignUpPassword = ({ navigation }: StackScreenProps<{}>) => {
  const { execute, context } = useAuthMachine();
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit, values } = useForm<{
    password: string;
  }>(
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
              : pipe(
                  signUpWithEmail(context.emailAddress!, fields.password),
                  TE.map(() => {
                    execute((ctx) => {
                      ctx.password = values.password;
                    });
                    return "";
                  }),
                ),
          ),
          TE.mapLeft((err) => {
            execute((ctx) => {
              ctx.password = undefined;
            });
            return err;
          }),
        ),
      ),
    [submit, context, execute, values],
  );

  const handleForgottenPassword = useCallback(
    () =>
      runWithUIState(
        pipe(
          sendForgottenPasswordEmail(context.emailAddress!),
          TE.map(() => {
            execute((ctx) => {
              ctx.password = undefined;
              ctx.hasResetPassword = true;
            });
          }),
        ),
      ),
    [context, execute],
  );

  return (
    <ScreenLayout
      footer={
        <Footer>
          {context.authenticationFlow === "signIn" ? (
            <EmailButton type="plain" onPress={handleForgottenPassword}>
              I've forgotten my password
            </EmailButton>
          ) : null}

          <Button onPress={handleSignUp} large>
            Next
          </Button>
        </Footer>
      }
    >
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
          autoCapitalize="none"
          autoCorrect={false}
        />
      </SplashContainer>
    </ScreenLayout>
  );
};

const EmailButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8};
`;

export const signUpPasswordRoute = makeNavigationRoute({
  screen: SignUpPassword,
  stackName: AUTH_STACK_NAME,
  routeName: routeNames.signUpPasswordRoute,
});
