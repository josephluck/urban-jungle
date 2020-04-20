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
import { Calendar } from "./calendar";
import styled from "styled-components/native";
import { symbols } from "../../../theme";
import { HouseholdTodosSubscription } from "../../todos/subscriptions/household-todos";

export const Home = () => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

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

  return (
    <ScreenLayout>
      {selectedHouseholdId ? (
        <HomeScreenContainer>
          <HouseholdPlantsSubscription householdId={selectedHouseholdId} />
          <HouseholdCaresSubscription householdId={selectedHouseholdId} />
          <HouseholdTodosSubscription householdId={selectedHouseholdId} />
          <WelcomeMessage>👋 You have a few things to do today.</WelcomeMessage>
          <Calendar householdId={selectedHouseholdId} />
        </HomeScreenContainer>
      ) : null}
    </ScreenLayout>
  );
};

const WelcomeMessage = styled(Heading)`
  padding-horizontal: ${symbols.spacing.appHorizontal};
  margin-bottom: ${symbols.spacing.appHorizontal * 2};
`;

const HomeScreenContainer = styled.View`
  padding-top: ${symbols.spacing.appVertical};
  flex-grow: 1;
  background-color: ${symbols.colors.appBackground};
`;

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
