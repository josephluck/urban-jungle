import { StackScreenProps } from "@react-navigation/stack";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import {
  Footer,
  ScreenLayout,
} from "../../../components/layouts/screen-layout";
import { ScreenTitle } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { AUTH_STACK_NAME } from "../../../navigation/stack-names";
import { symbols } from "../../../theme";
import { useAuthMachine } from "../machine/machine";
import { routeNames } from "./route-names";

const SplashScreen = ({}: StackScreenProps<{}>) => {
  const { execute } = useAuthMachine();

  const handleSignUp = useCallback(
    () =>
      execute((ctx) => {
        ctx.authenticationFlow = "signUp";
      }),
    [],
  );

  const handleSignIn = useCallback(
    () =>
      execute((ctx) => {
        ctx.authenticationFlow = "signIn";
      }),
    [],
  );

  return (
    <ScreenLayout
      footer={
        <Footer>
          <Button
            onPress={handleSignIn}
            style={{ marginBottom: symbols.spacing._8 }}
            type="plain"
          >
            Sign in
          </Button>
          <Button onPress={handleSignUp} large>
            Create account
          </Button>
        </Footer>
      }
    >
      <SplashContainer>
        <ScreenTitle title="🌱 Urban Jungle" />
      </SplashContainer>
    </ScreenLayout>
  );
};

export const splashRoute = makeNavigationRoute({
  routeName: routeNames.splashRoute,
  stackName: AUTH_STACK_NAME,
  screen: SplashScreen,
});

export const SplashContainer = styled.View`
  flex: 1;
  justify-content: space-between;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-bottom: ${symbols.spacing._16}px;
`;
