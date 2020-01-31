import React, { useCallback, useContext } from "react";
import { Heading, SubHeading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/screen-layout";
import {
  useAuthStore,
  selectUser,
  signOut,
  selectProfile
} from "../../auth/store";
import { Button } from "react-native";
import { NavigationContext } from "react-navigation";
import {
  createLoginRoute,
  createSignUpRoute
} from "../../auth/navigation/routes";
import { Option } from "space-lift";

export const Home = () => {
  const user_ = useAuthStore(selectUser);
  const profile_ = useAuthStore(selectProfile);

  return Option.all([user_, profile_]).fold(
    () => <SplashScreen />,
    ([user, profile]) => (
      <ScreenLayout>
        <Heading>Hello</Heading>
        <SubHeading>{user.email}</SubHeading>
        <SubHeading>{profile.name}</SubHeading>
        <Button title="Sign out" onPress={signOut} />
      </ScreenLayout>
    )
  );
};

const SplashScreen = () => {
  const { navigate } = useContext(NavigationContext);

  const handleSignUp = useCallback(() => {
    navigate(createSignUpRoute());
  }, []);

  const handleSignIn = useCallback(() => {
    navigate(createLoginRoute());
  }, []);

  return (
    <ScreenLayout>
      <Heading>Plantpal</Heading>
      <Button title="Create account" onPress={handleSignUp} />
      <Button title="Sign in" onPress={handleSignIn} />
    </ScreenLayout>
  );
};
