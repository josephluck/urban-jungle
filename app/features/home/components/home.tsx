import React, { useCallback, useContext, useEffect } from "react";
import { pipe } from "fp-ts/lib/pipeable";
import { Heading, SubHeading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/screen-layout";
import {
  useAuthStore,
  signOut,
  selectHasAuthenticated,
  selectUserEmail
} from "../../auth/store";
import { Button } from "react-native";
import { NavigationContext } from "react-navigation";
import {
  createLoginRoute,
  createSignUpRoute
} from "../../auth/navigation/routes";
import { useFetcher } from "../../../hooks/fetcher";
import {
  fetchHouseholds,
  useHouseholdsStore,
  selectHouseholds
} from "../../households/store";
import * as O from "fp-ts/lib/Option";

export const Home = () => {
  const hasAuthenticated = useAuthStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <Households />;
  }

  return <SplashScreen />;
};

const Households = () => {
  const name = useAuthStore(selectUserEmail);
  const email = useAuthStore(selectUserEmail);
  const households = useHouseholdsStore(selectHouseholds);

  const fetcher = useFetcher(fetchHouseholds);

  useEffect(() => {
    fetcher.fetch();
  }, []);

  return (
    <ScreenLayout>
      <Heading>Hello</Heading>
      <SubHeading>
        {pipe(
          name,
          O.getOrElse(() => "")
        )}
      </SubHeading>
      <SubHeading>
        {pipe(
          email,
          O.getOrElse(() => "")
        )}
      </SubHeading>
      {households.map(household => (
        <Heading key={household.id}>{household.name}</Heading>
      ))}
      <Button title="Sign out" onPress={signOut} />
    </ScreenLayout>
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
