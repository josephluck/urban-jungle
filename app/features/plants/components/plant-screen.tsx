import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import moment from "moment";
import React from "react";
import { View } from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { ListItem } from "../../../components/list-item";
import { PlantOverview } from "../../../components/plant-overview";
import { ScreenLayout } from "../../../components/screen-layout";
import { TouchableIcon } from "../../../components/touchable-icon";
import { SubHeading } from "../../../components/typography";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { sortByMostRecent } from "../../../utils/sort";
import { selectCaresForPlant } from "../../care/store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { createTodoForPlant } from "../../todos/store/effects";
import { selectTodosForPlant } from "../../todos/store/state";
import {
  selectMostLovedByForPlant,
  selectPlantByHouseholdId,
} from "../store/state";

export const PlantScreen = ({ navigation }: NavigationStackScreenProps) => {
  const plantId = navigation.getParam(PLANT_ID);
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );
  const plant = useStore(() =>
    selectPlantByHouseholdId(selectedHouseholdId, plantId)
  );

  const todos = useStore(
    () => selectTodosForPlant(plantId)(selectedHouseholdId),
    [plantId, selectedHouseholdId]
  );

  const cares = useStore(
    () =>
      selectCaresForPlant(selectedHouseholdId)(plantId).sort(sortByMostRecent),
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
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  margin-vertical: ${symbols.spacing._20}px;
`;

const ScreenControls = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ScreenContent = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;

const SectionHeading = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: ${symbols.spacing._16}px;
  background-color: ${symbols.colors.appBackground};
`;
