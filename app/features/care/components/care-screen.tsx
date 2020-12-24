import { StackScreenProps } from "@react-navigation/stack";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import styled from "styled-components/native";

import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { Heading } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { careSessionRoute } from "./care-session-screen";
import { Schedule } from "./schedule";

export const CareScreen = ({ navigation }: StackScreenProps<{}>) => {
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );

  const handleNavigateToCareSession = useCallback(
    (todoIds: string[]) => {
      careSessionRoute.navigateTo(navigation, { todoIds });
    },
    [navigation.navigate],
  );

  return (
    <ScreenLayout isRootScreen>
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
`;

export const careRoute = makeNavigationRoute({
  screen: CareScreen,
  routeName: "CARE_SCREEN",
});
