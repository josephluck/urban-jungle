import { StackScreenProps } from "@react-navigation/stack";
import { sortByMostRecent } from "@urban-jungle/shared/utils/sort";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { TouchableOpacity } from "react-native";
import { Button } from "../../../components/button";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { ListItem } from "../../../components/list-item";
import { Heading } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { selectPlantsByHouseholdId } from "../store/state";
import { newPlantPictureRoute } from "./new-plant/new-plant-picture-screen";
import { plantRoute } from "./plant-screen";

export const PlantsScreen = ({ navigation }: StackScreenProps<{}>) => {
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

  const handleAddNew = useCallback(
    () => newPlantPictureRoute.navigateTo(navigation, {}),
    []
  );

  return (
    <ScreenLayout isRootScreen>
      {selectedHouseholdId ? (
        <ScreenContainer>
          <WelcomeMessageContainer>
            <Heading>Your plants</Heading>
            <Button onPress={handleAddNew}>Add</Button>
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
                  plantRoute.navigateTo(navigation, { plantId: plant.id })
                }
              >
                <ListItem
                  title={plant.name}
                  image={pipe(
                    O.fromNullable(plant.avatar),
                    O.map((avatar) => avatar.uri),
                    O.getOrElse(() => "")
                  )}
                />
              </TouchableOpacity>
            ))}
          </PlantsList>
        </ScreenContainer>
      ) : null}
    </ScreenLayout>
  );
};

export const plantsRoute = makeNavigationRoute({
  screen: PlantsScreen,
  routeName: "PLANTS_SCREEN",
});

const ScreenContainer = styled.View`
  padding-top: ${symbols.spacing.appVertical}px;
  flex-grow: 1;
`;

const PlantsList = styled.ScrollView`
  flex: 1;
  padding-bottom: ${symbols.spacing.appVertical}px;
`;

const WelcomeMessageContainer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  margin-bottom: ${symbols.spacing.appHorizontal * 2}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
