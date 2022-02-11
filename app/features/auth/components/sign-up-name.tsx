import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { View } from "react-native";
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

const SignUpName = ({ navigation }: StackScreenProps<{}>) => {
  const { execute } = useAuthMachine();
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{ name: string }>(
    { name: "" },
    { name: [constraints.isRequired, constraints.isString] },
  );

  const handleSignUp = useCallback(
    () =>
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
      ),
    [submit, execute],
  );

  return (
    <ScreenLayout
      onBack={navigation.goBack}
      footer={
        <View
          style={{
            paddingHorizontal: symbols.spacing.appHorizontal,
            paddingVertical: symbols.spacing._16,
          }}
        >
          <Button onPress={handleSignUp} large>
            Next
          </Button>
        </View>
      }
    >
      <SplashContainer>
        <ScreenTitle title="🌱 Urban Jungle" description="What's your name?" />

        <TextField
          {...registerTextInput("name")}
          textContentType="name"
          autoCompleteType="name"
          returnKeyType="send"
          onSubmitEditing={handleSignUp}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </SplashContainer>
    </ScreenLayout>
  );
};

export const signUpNameRoute = makeNavigationRoute({
  screen: SignUpName,
  stackName: AUTH_STACK_NAME,
  routeName: routeNames.signUpNameRoute,
});
