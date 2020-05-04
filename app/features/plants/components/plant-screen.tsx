import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import moment from "moment";
import React, { useCallback } from "react";
import { View } from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { ListItem } from "../../../components/list-item";
import { PlantOverview } from "../../../components/plant-overview";
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
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";

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

  const stickyHeaderIndices = O.isSome(mostLovedBy) ? [1, 3, 5] : [1, 3];

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);

  return (
    <BackableScreenLayout
      onBack={handleGoBack}
      stickyHeaderIndices={stickyHeaderIndices}
    >
      {pipe(
        plant,
        O.fold(
          () => null,
          (plant) => (
            <>
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
                    <SectionHeading key="most-loved-by">
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
              <View>
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
            </>
          )
        )
      )}
    </BackableScreenLayout>
  );
};

export const PLANT_SCREEN = "PLANT_SCREEN";

export const PLANT_ID = "PLANT_ID";

export const createPlantRoute = (plantId: string) => ({
  routeName: PLANT_SCREEN,
  params: { [PLANT_ID]: plantId },
});

const SectionHeading = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: ${symbols.spacing._16}px;
  background-color: ${symbols.colors.appBackground};
`;
