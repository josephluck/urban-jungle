import React, { useCallback, useContext, useEffect } from "react";
import { Heading, SubHeading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/screen-layout";
import {
  useAuthStore,
  selectUser,
  signOut,
  selectProfile,
  selectHasAuthenticated
} from "../../auth/store";
import { Button } from "react-native";
import { NavigationContext } from "react-navigation";
import {
  createLoginRoute,
  createSignUpRoute
} from "../../auth/navigation/routes";
import { Option } from "space-lift";
import { useFetcher } from "../../../hooks/fetcher";
import {
  fetchHouseholds,
  useHouseholdsStore,
  selectHouseholds
} from "../../households/store";

export const Home = () => {
  const hasAuthenticated = useAuthStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <Households />;
  }

  return <SplashScreen />;
};

const Households = () => {
  const user_ = useAuthStore(selectUser);
  const profile_ = useAuthStore(selectProfile);
  const households = useHouseholdsStore(selectHouseholds);

  const fetcher = useFetcher(fetchHouseholds);

  useEffect(() => {
    fetcher.fetch();
  }, []);

  console.log({ households });

  return Option.all([user_, profile_]).fold(
    () => null,
    ([user, profile]) => (
      <ScreenLayout>
        <Heading>Hello</Heading>
        <SubHeading>{user.email}</SubHeading>
        <SubHeading>{profile.name}</SubHeading>
        {households.map(household => (
          <Heading key={household.id}>{household.name}</Heading>
        ))}
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
