import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useRunWithUIState } from "../../../store/ui";
import { useAuthMachine } from "../machine/machine";
import { signInWithEmail } from "../store/effects";
import { routeNames } from "./route-names";
import { SplashContainer } from "./splash";

const SignUpResetPassword = ({ navigation }: StackScreenProps<{}>) => {
  const { execute, context } = useAuthMachine();
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit, values } = useForm<{
    password: string;
  }>(
    { password: "" },
    { password: [constraints.isRequired, constraints.isString] },
  );

  const handleSubmit = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.chain((fields) =>
            signInWithEmail(context.emailAddress!, fields.password),
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

  return (
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <SplashContainer>
        <ScreenTitle
          title="🌱 Urban Jungle"
          description="What's your new password?"
        />

        <TextField
          {...registerTextInput("password")}
          textContentType="password"
          secureTextEntry
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button onPress={handleSubmit} large>
          Next
        </Button>
      </SplashContainer>
    </BackableScreenLayout>
  );
};

export const signUpResetPasswordRoute = makeNavigationRoute({
  screen: SignUpResetPassword,
  routeName: routeNames.resetPasswordEnterNewPassword,
});
