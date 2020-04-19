import React, { useCallback, useContext } from "react";
import { Heading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/screen-layout";
import { selectHasAuthenticated } from "../../auth/store/state";
import { Button } from "react-native";
import { NavigationContext } from "react-navigation";
import {
  createLoginRoute,
  createSignUpRoute,
} from "../../auth/navigation/routes";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { HouseholdPlantsSubscription } from "../../plants/subscriptions/household-plants";
import { useStore } from "../../../store/state";
import { HouseholdCaresSubscription } from "../../care/subscriptions/household-cares";

export const Home = () => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

  console.log({ hasAuthenticated });

  if (hasAuthenticated) {
    return <HomeScreen />;
  }

  return <SplashScreen />;
};

const HomeScreen = () => {
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );

  console.log("Rendering home screen", { selectedHouseholdId });

  return (
    <ScreenLayout>
      {selectedHouseholdId ? (
        <>
          <HouseholdPlantsSubscription householdId={selectedHouseholdId} />
          <HouseholdCaresSubscription householdId={selectedHouseholdId} />
          <Heading>👋 You have a couple of plants to care for today.</Heading>
        </>
      ) : null}
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
      <Heading>Urban Jungle</Heading>
      <Button title="Create account" onPress={handleSignUp} />
      <Button title="Sign in" onPress={handleSignIn} />
    </ScreenLayout>
  );
};
