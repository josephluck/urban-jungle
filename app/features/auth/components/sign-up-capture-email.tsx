import { StackScreenProps } from "@react-navigation/stack";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
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
import { useMachine } from "../machine/machine";
import { routeNames } from "./route-names";
import { SplashContainer } from "./splash";

const SignUpCaptureEmail = ({ navigation }: StackScreenProps<{}>) => {
  const { execute } = useMachine();
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{ email: string }>(
    { email: "" },
    { email: [constraints.isRequired, constraints.isString] },
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
        }),
      ),
    );
  }, [submit, execute]);

  const handleSkip = useCallback(() => {
    execute((ctx) => {
      ctx.skipEmailAddress = true;
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

        <SkipButton type="plain" onPress={handleSkip}>
          Skip
        </SkipButton>

        <Button onPress={handleSignUp} large>
          Next
        </Button>
      </SplashContainer>
    </BackableScreenLayout>
  );
};

const SkipButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8};
`;

export const signUpCaptureEmailRoute = makeNavigationRoute({
  screen: SignUpCaptureEmail,
  routeName: routeNames.signUpCaptureEmailRoute,
});
