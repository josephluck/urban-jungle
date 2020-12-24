import React, { useCallback } from "react";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";

import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { TextField } from "../../../components/text-field";
import { useRunWithUIState } from "../../../store/ui";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { Button } from "../../../components/button";
import { IErr } from "@urban-jungle/shared/utils/err";
import { StackScreenProps } from "@react-navigation/stack";
import { routeNames } from "./route-names";
import { useMachine } from "../machine/machine";
import { SplashContainer } from "./splash";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";

const SignUpCaptureEmail = ({ navigation }: StackScreenProps<{}>) => {
  const { execute } = useMachine();
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{ email: string }>(
    { email: "" },
    { email: [constraints.isRequired, constraints.isString] }
  );

  const handleSignUp = useCallback(async () => {
    runWithUIState(
      pipe(
        TE.fromEither(submit()),
        TE.mapLeft(() => "VALIDATION" as IErr),
        TE.map((fields) => {
          execute((ctx) => {
            ctx.emailAddress = fields.email;
          });
        })
      )
    );
  }, [submit, execute]);

  return (
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <SplashContainer>
        <ScreenTitle
          title="🌱 Urban Jungle"
          description="And your email address?"
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

        <Button onPress={handleSignUp} large>
          Next
        </Button>
      </SplashContainer>
    </BackableScreenLayout>
  );
};

export const signUpCaptureEmailRoute = makeNavigationRoute({
  screen: SignUpCaptureEmail,
  routeName: routeNames.signUpCaptureEmailRoute,
});
