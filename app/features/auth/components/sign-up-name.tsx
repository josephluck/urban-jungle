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

const SignUpName = ({ navigation }: StackScreenProps<{}>) => {
  const { execute } = useMachine();
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{ name: string }>(
    { name: "" },
    { name: [constraints.isRequired, constraints.isString] },
  );

  const handleSignUp = useCallback(async () => {
    runWithUIState(
      pipe(
        TE.fromEither(submit()),
        TE.mapLeft(() => "VALIDATION" as IErr),
        TE.map((fields) => {
          execute((ctx) => {
            ctx.name = fields.name;
          });
        }),
      ),
    );
  }, [submit, execute]);

  return (
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <SplashContainer>
        <ScreenTitle title="🌱 Urban Jungle" description="What's your name?" />

        <TextField
          {...registerTextInput("name")}
          textContentType="name"
          autoCompleteType="name"
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

export const signUpNameRoute = makeNavigationRoute({
  screen: SignUpName,
  routeName: routeNames.signUpNameRoute,
});
