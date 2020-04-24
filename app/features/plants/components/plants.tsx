import React from "react";
import { ScreenLayout } from "../../../components/screen-layout";
import { selectHasAuthenticated } from "../../auth/store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { HouseholdPlantsSubscription } from "../../plants/subscriptions/household-plants";
import { useStore } from "../../../store/state";
import { HouseholdCaresSubscription } from "../../care/subscriptions/household-cares";
import styled from "styled-components/native";
import { symbols } from "../../../theme";
import { ListItem } from "../../../components/list-item";
import { Heading } from "../../../components/typography";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";
import { IconButton } from "../../../components/icon-button";
import {
  createPlantForHousehold,
  deletePlantByHouseholdId,
} from "../store/effects";
import { selectPlantsByHouseholdId } from "../store/state";
import { TouchableOpacity } from "react-native-gesture-handler";

export const Plants = () => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <PlantsScreen />;
  }

  return null;
};

const PlantsScreen = () => {
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );
  const plants = useStore(() => selectPlantsByHouseholdId(selectedHouseholdId));

  return (
    <ScreenLayout>
      {selectedHouseholdId ? (
        <ScreenContainer>
          <HouseholdPlantsSubscription householdId={selectedHouseholdId} />
          <HouseholdCaresSubscription householdId={selectedHouseholdId} />
          <WelcomeMessageContainer>
            <Heading>Your plants</Heading>
            <IconButton
              icon={faPlus}
              onPress={() => createPlantForHousehold()(selectedHouseholdId)()}
            >
              Add
            </IconButton>
          </WelcomeMessageContainer>
          <PlantsList
            contentContainerStyle={{
              paddingHorizontal: symbols.spacing.appHorizontal,
            }}
          >
            {plants.map((plant) => (
              <TouchableOpacity
                key={plant.id}
                onPress={() =>
                  deletePlantByHouseholdId(selectedHouseholdId)(plant.id)()
                }
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
  padding-top: ${symbols.spacing.appVertical};
  flex-grow: 1;
  background-color: ${symbols.colors.appBackground};
`;

const PlantsList = styled.ScrollView`
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
