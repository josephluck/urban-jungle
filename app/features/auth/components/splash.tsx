import React, { useCallback, useContext } from "react";
import { Button } from "react-native";
import { NavigationComponent, NavigationContext } from "react-navigation";
import { ScreenLayout } from "../../../components/screen-layout";
import { Heading } from "../../../components/typography";
import { useStore } from "../../../store/state";
import { selectHasAuthenticated } from "../store/state";
import { createLoginRoute } from "./sign-in";
import { createSignUpRoute } from "./sign-up";

export const SplashScreen = () => {
  const { navigate } = useContext(NavigationContext);

  const handleSignUp = useCallback(() => {
    navigate(createSignUpRoute());
  }, []);

  const handleSignIn = useCallback(() => {
    navigate(createLoginRoute());
  }, []);

  return (
    <ScreenLayout>
      <Heading>Urban Jungle</Heading>
      <Button title="Create account" onPress={handleSignUp} />
      <Button title="Sign in" onPress={handleSignIn} />
    </ScreenLayout>
  );
};

export const authGuard = (Screen: NavigationComponent<any, any>) => (
  props: any
) => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <Screen {...props} />;
  }

  return <SplashScreen />;
};
