import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { Heading } from "../../../components/typography";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { careSessionRoute } from "./care-session-screen";
import { Schedule } from "./schedule";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";

export const CareScreen = ({ navigation }: NavigationStackScreenProps) => {
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );

  const handleNavigateToCareSession = useCallback(
    (todoIds: string[]) => {
      careSessionRoute.navigateTo(navigation, { todoIds });
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
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  margin-bottom: ${symbols.spacing.appHorizontal * 2}px;
`;

const CareScreenContainer = styled.View`
  padding-top: ${symbols.spacing.appVertical}px;
  flex-grow: 1;
  background-color: ${symbols.colors.appBackground};
`;

export const careRoute = makeNavigationRoute({
  screen: CareScreen,
  routeName: "CARE_SCREEN",
  authenticated: true,
});
