import React from "react";
import { ScreenLayout } from "../../../components/screen-layout";
import { selectHasAuthenticated } from "../../auth/store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { useStore } from "../../../store/state";
import styled from "styled-components/native";
import { symbols } from "../../../theme";
import { SubHeading } from "../../../components/typography";
import {
  selectPlantByHouseholdAndId,
  selectMostLovedByForPlant,
} from "../store/state";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { Button } from "../../../components/button";
import { View } from "react-native";
import { createTodoForPlant } from "../../todos/store/effects";
import { ListItem } from "../../../components/list-item";
import { selectTodosForPlant } from "../../todos/store/state";
import { selectCaresForPlant } from "../../care/store/state";
import { TouchableIcon } from "../../../components/touchable-icon";
import { sequenceT } from "fp-ts/lib/Apply";
import moment from "moment";
import { PlantOverview } from "../../../components/plant-overview";

export const Plant = (props: NavigationStackScreenProps) => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <PlantScreen {...props} />;
  }

  return null;
};

const sequenceO = sequenceT(O.option);

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

  const todos = useStore(
    () => selectTodosForPlant(plantId)(selectedHouseholdId),
    [plantId, selectedHouseholdId]
  );

  const cares = useStore(
    () => selectCaresForPlant(selectedHouseholdId)(plantId),
    [plantId, selectedHouseholdId]
  );

  const mostLovedBy = useStore(
    () => selectMostLovedByForPlant(selectedHouseholdId)(plantId),
    [plantId, selectedHouseholdId]
  );

  const stickyIndicies = O.isSome(mostLovedBy) ? [1, 3, 5] : [1, 3];

  return (
    <ScreenLayout>
      {pipe(
        plant,
        O.fold(
          () => null,
          (plant) => (
            <ScreenContainer>
              <Header>
                <ScreenControls>
                  <TouchableIcon
                    onPress={() => navigation.goBack()}
                    icon="arrow-left"
                  />
                  <TouchableIcon
                    onPress={() => navigation.goBack()}
                    icon="more-vertical"
                  />
                </ScreenControls>
              </Header>
              <ScreenContent stickyHeaderIndices={stickyIndicies}>
                <PlantOverview
                  name={plant.name}
                  location={plant.location}
                  avatar={plant.avatar}
                />
                {pipe(
                  mostLovedBy,
                  O.fold(
                    () => null,
                    (profile) => [
                      <SectionHeading>
                        <SubHeading weight="bold">Most loved by</SubHeading>
                      </SectionHeading>,
                      <View>
                        <ListItem title={profile.name} image={profile.avatar} />
                      </View>,
                    ]
                  )
                )}
                <SectionHeading>
                  <SubHeading weight="bold">Todos</SubHeading>
                  <Button
                    onPress={createTodoForPlant(plant.id)(plant.householdId)()}
                    style={{ marginLeft: symbols.spacing._16 }}
                  >
                    Add
                  </Button>
                </SectionHeading>
                <View>
                  {todos.map((todo) => (
                    <ListItem key={todo.id} title={todo.title} />
                  ))}
                </View>
                <SectionHeading>
                  <SubHeading weight="bold">Care history</SubHeading>
                </SectionHeading>
                <View style={{ height: 1000 }}>
                  {cares.map((care) => (
                    <ListItem
                      key={care.id}
                      title={care.todo.title}
                      detail={`By ${care.profile.name} on ${moment(
                        care.dateCreated.toDate()
                      ).format("Do MMM YY")}`}
                    />
                  ))}
                </View>
              </ScreenContent>
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
  flex-grow: 1;
  background-color: ${symbols.colors.appBackground};
`;

const Header = styled.View`
  padding-top: ${symbols.spacing._20};
  padding-horizontal: ${symbols.spacing.appHorizontal};
  margin-bottom: ${symbols.spacing._20};
`;

const ScreenControls = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const PlantImage = styled.Image`
  border-radius: 30;
  width: 100%;
  aspect-ratio: 2;
`;

const PlantImagePlaceholder = styled.View`
  background-color: ${symbols.colors.nearWhite};
  border-radius: 30;
  width: 100%;
  aspect-ratio: 2;
`;

const ScreenContent = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal};
`;

const SectionHeading = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: ${symbols.spacing._16};
  background-color: ${symbols.colors.appBackground};
`;
