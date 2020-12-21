import React, { useCallback, useContext } from "react";
import { Button } from "react-native";
import { NavigationContext } from "@react-navigation/native";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { Heading } from "../../../components/typography";
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
