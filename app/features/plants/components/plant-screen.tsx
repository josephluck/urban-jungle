import React from "react";
import { ScreenLayout } from "../../../components/screen-layout";
import { selectHasAuthenticated } from "../../auth/store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { useStore } from "../../../store/state";
import styled from "styled-components/native";
import { symbols } from "../../../theme";
import { Heading } from "../../../components/typography";
import { selectPlantByHouseholdAndId } from "../store/state";
import { NavigationStackScreenProps } from "react-navigation-stack";

export const Plant = (props: NavigationStackScreenProps) => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <PlantScreen {...props} />;
  }

  return null;
};

const PlantScreen = ({ navigation }: NavigationStackScreenProps) => {
  const plantId = navigation.getParam(PLANT_ID);
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );
  const plant = useStore(() =>
    selectPlantByHouseholdAndId(selectedHouseholdId)(plantId)
  );

  return (
    <ScreenLayout>
      {pipe(
        plant,
        O.fold(
          () => null,
          (plant) => (
            <ScreenContainer>
              <WelcomeMessageContainer>
                <Heading>{plant.name}</Heading>
              </WelcomeMessageContainer>
            </ScreenContainer>
          )
        )
      )}
    </ScreenLayout>
  );
};

export const PLANT_SCREEN = "PLANT_SCREEN";
export const PLANT_ID = "PLANT_ID";
export const createPlantRoute = (plantId: string) => ({
  routeName: PLANT_SCREEN,
  params: { [PLANT_ID]: plantId },
});

const ScreenContainer = styled.View`
  padding-top: ${symbols.spacing.appVertical};
  flex-grow: 1;
  background-color: ${symbols.colors.appBackground};
`;

const WelcomeMessageContainer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal};
  margin-bottom: ${symbols.spacing.appHorizontal * 2};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
