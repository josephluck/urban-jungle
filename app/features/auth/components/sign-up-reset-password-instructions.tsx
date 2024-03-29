import { StackScreenProps } from "@react-navigation/stack";
import { Button } from "@urban-jungle/design/components/button";
import {
  Footer,
  ScreenLayout,
} from "@urban-jungle/design/components/layouts/screen-layout";
import {
  BodyText,
  ScreenTitle,
} from "@urban-jungle/design/components/typography";
import { symbols } from "@urban-jungle/design/theme";
import React, { useCallback } from "react";
import { View } from "react-native";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { AUTH_STACK_NAME } from "../../../navigation/stack-names";
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
    <ScreenLayout
      footer={
        <Footer>
          <Button onPress={handleSubmit} large>
            I've reset my password
          </Button>
        </Footer>
      }
    >
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
      </SplashContainer>
    </ScreenLayout>
  );
};

export const signUpResetPasswordInstructionsRoute = makeNavigationRoute({
  screen: SignUpResetPasswordInstructions,
  stackName: AUTH_STACK_NAME,
  routeName: routeNames.resetPasswordInstructions,
});
