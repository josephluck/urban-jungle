import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { ListItem } from "../../../components/list-item";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { Heading } from "../../../components/typography";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { sortByMostRecent } from "../../../utils/sort";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { createPlantForHousehold } from "../store/effects";
import { selectPlantsByHouseholdId } from "../store/state";
import { createPlantRoute } from "./plant-screen";

export const PlantsScreen = ({ navigation }: NavigationStackScreenProps) => {
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );
  const plants = useStore(() =>
    selectPlantsByHouseholdId(selectedHouseholdId).sort(sortByMostRecent)
  );

  return (
    <ScreenLayout>
      {selectedHouseholdId ? (
        <ScreenContainer>
          <WelcomeMessageContainer>
            <Heading>Your plants</Heading>
            <Button
              onPress={() => createPlantForHousehold()(selectedHouseholdId)()}
            >
              Add
            </Button>
          </WelcomeMessageContainer>
          <PlantsList
            contentContainerStyle={{
              paddingHorizontal: symbols.spacing.appHorizontal,
            }}
          >
            {plants.map((plant) => (
              <TouchableOpacity
                key={plant.id}
                onPress={() => navigation.navigate(createPlantRoute(plant.id))}
              >
                <ListItem title={plant.name} image={plant.avatar} />
              </TouchableOpacity>
            ))}
          </PlantsList>
        </ScreenContainer>
      ) : null}
    </ScreenLayout>
  );
};

const ScreenContainer = styled.View`
  padding-top: ${symbols.spacing.appVertical}px;
  flex-grow: 1;
  background-color: ${symbols.colors.appBackground};
`;

const PlantsList = styled.ScrollView`
  flex: 1;
  background-color: ${symbols.colors.appBackground};
  padding-bottom: ${symbols.spacing.appVertical}px;
`;

const WelcomeMessageContainer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  margin-bottom: ${symbols.spacing.appHorizontal * 2}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
