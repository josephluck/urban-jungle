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
import { useStore } from "../../../store/state";
import { Schedule } from "./schedule";
import styled from "styled-components/native";
import { symbols } from "../../../theme";
import { createCareSessionRoute } from "./care-session-screen";
import { NavigationStackScreenProps } from "react-navigation-stack";

export const Root = (props: NavigationStackScreenProps) => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <CareScreen {...props} />;
  }

  return <SplashScreen />;
};

const CareScreen = ({ navigation }: NavigationStackScreenProps) => {
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );

  const handleNavigateToCareSession = useCallback(
    (todoIds: string[]) => {
      navigation.navigate(createCareSessionRoute(todoIds));
    },
    [navigation.navigate]
  );

  return (
    <ScreenLayout>
      {selectedHouseholdId ? (
        <CareScreenContainer>
          <WelcomeMessage>👋 You have a few things to do today.</WelcomeMessage>
          <Schedule handleNavigateToCareSession={handleNavigateToCareSession} />
        </CareScreenContainer>
      ) : null}
    </ScreenLayout>
  );
};

const WelcomeMessage = styled(Heading)`
  padding-horizontal: ${symbols.spacing.appHorizontal};
  margin-bottom: ${symbols.spacing.appHorizontal * 2};
`;

const CareScreenContainer = styled.View`
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
