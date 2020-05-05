import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";

export const ManagePlantScreen = ({
  navigation,
}: NavigationStackScreenProps) => {
  const plantId = navigation.getParam(PLANT_ID);

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );

  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);

  return (
    <BackableScreenLayout onBack={handleGoBack}>
      <ContentContainer></ContentContainer>
    </BackableScreenLayout>
  );
};

export const MANAGE_PLANT_SCREEN = "MANAGE_PLANT_SCREEN";

export const PLANT_ID = "PLANT_ID";

export const createPlantRoute = (plantId: string) => ({
  routeName: MANAGE_PLANT_SCREEN,
  params: { [PLANT_ID]: plantId },
});

const ContentContainer = styled.View`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;
