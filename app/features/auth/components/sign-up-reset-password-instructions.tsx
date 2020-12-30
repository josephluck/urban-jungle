import { StackScreenProps } from "@react-navigation/stack";
import React, { useCallback } from "react";
import { View } from "react-native";
import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { BodyText, ScreenTitle } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { symbols } from "../../../theme";
import { useAuthMachine } from "../machine/machine";
import { routeNames } from "./route-names";
import { SplashContainer } from "./splash";

const SignUpResetPasswordInstructions = ({
  navigation,
}: StackScreenProps<{}>) => {
  const { execute } = useAuthMachine();

  const handleSubmit = useCallback(
    () =>
      execute((ctx) => {
        ctx.hasSeenResetPasswordInstructions = true;
      }),
    [execute],
  );

  return (
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <SplashContainer>
        <ScreenTitle title="🌱 Urban Jungle" />

        <View>
          <BodyText
            style={{ textAlign: "center", marginBottom: symbols.spacing._8 }}
          >
            We've sent you an email with instructions on how to reset your
            password.
          </BodyText>

          <BodyText style={{ textAlign: "center" }}>
            When you're done, come back to Urban Jungle to sign in with your new
            password.
          </BodyText>
        </View>

        <Button onPress={handleSubmit} large>
          I've reset my password
        </Button>
      </SplashContainer>
    </BackableScreenLayout>
  );
};

export const signUpResetPasswordInstructionsRoute = makeNavigationRoute({
  screen: SignUpResetPasswordInstructions,
  routeName: routeNames.resetPasswordInstructions,
});
