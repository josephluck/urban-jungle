import React, { useCallback, useContext } from "react";
import { Heading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/screen-layout";
import { useAuthStore, selectUser, signOut } from "../../auth/store";
import { Button } from "react-native";
import { NavigationContext } from "react-navigation";
import {
  createLoginRoute,
  createSignUpRoute
} from "../../auth/navigation/routes";

export const Home = () => {
  const { navigate } = useContext(NavigationContext);
  const user = useAuthStore(selectUser);

  const handleSignUp = useCallback(() => {
    navigate(createSignUpRoute());
  }, []);

  const handleSignIn = useCallback(() => {
    navigate(createLoginRoute());
  }, []);

  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

  if (user) {
    return (
      <ScreenLayout>
        <Heading>My Plants</Heading>
        <Button title="Sign out" onPress={handleSignOut} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <Heading>Plantpal</Heading>
      <Button title="Create account" onPress={handleSignUp} />
      <Button title="Sign in" onPress={handleSignIn} />
    </ScreenLayout>
  );
};
