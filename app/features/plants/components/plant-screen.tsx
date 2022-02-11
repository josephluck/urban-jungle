import { StackScreenProps } from "@react-navigation/stack";
import { makeImageModel } from "@urban-jungle/shared/models/image";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { ListItem } from "../../../components/list-item";
import { PlantImageHeader } from "../../../components/plant-image-header";
import { PlantNameAndLocation } from "../../../components/plant-name-and-location";
import { TouchableIcon } from "../../../components/touchable-icon";
import { TouchableOpacity } from "../../../components/touchable-opacity";
import { SubHeading } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { NavigationButtonList } from "../../../navigation/navigation-button-list";
import { PLANTS_STACK_NAME } from "../../../navigation/stack-names";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { manageTodoRoute } from "../../todos/components/manage-todo-screen";
import { selectTodosForPlant } from "../../todos/store/state";
import { getPlantName, selectPlantByHouseholdId } from "../store/state";
import { deletePlantRoute } from "./delete-plant";
import { managePlantRoute } from "./manage-plant-screen";

export const PlantScreen = ({
  navigation,
  route,
}: StackScreenProps<Record<keyof PlantRouteParams, undefined>>) => {
  const { plantId } = plantRoute.getParams(route);

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );

  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );

  const plant = useStore(() =>
    selectPlantByHouseholdId(selectedHouseholdId, plantId),
  );

  const todos = useStore(
    () => selectTodosForPlant(plantId)(selectedHouseholdId),
    [plantId, selectedHouseholdId],
  );
  const stickyHeaderIndices = [1, 3];

  const handleEdit = useCallback(() => {
    managePlantRoute.navigateTo(navigation, {
      plantId,
      name: pipe(
        plant,
        O.map((plant) => plant.name),
        O.getOrElse(() => ""),
      ),
      nickname: pipe(
        plant,
        O.filterMap((plant) => O.fromNullable(plant.nickname)),
        O.getOrElse(() => ""),
      ),
      location: pipe(
        plant,
        O.chain((plant) => O.fromNullable(plant.location)),
        O.getOrElse(() => ""),
      ),
      avatar: pipe(
        plant,
        O.chain((plant) => O.fromNullable(plant.avatar)),
        O.getOrElse(() => makeImageModel()),
      ),
    });
  }, [plantId, plant]);

  const handleAddNewTodo = useCallback(() => {
    manageTodoRoute.navigateTo(navigation, { plantId });
  }, [plantId]);

  return (
    <ScreenLayout
      onBack={navigation.goBack}
      stickyHeaderIndices={stickyHeaderIndices}
    >
      <NavigationButtonList>
        <TouchableIcon icon="edit-3" onPress={handleEdit} />
        <TouchableIcon
          icon="trash"
          onPress={() => deletePlantRoute.navigateTo(navigation, { plantId })}
        />
      </NavigationButtonList>
      {pipe(
        plant,
        O.fold(
          () => null,
          (plant) => (
            <>
              <SectionContent>
                <PlantNameAndLocation
                  name={getPlantName(plant)}
                  location={plant.location}
                />
              </SectionContent>
              <PlantImageHeader
                householdId={selectedHouseholdId}
                plantId={plantId}
              />
              <SectionHeading>
                <SubHeading weight="bold">Todos</SubHeading>
                <TouchableIcon
                  icon="plus"
                  onPress={handleAddNewTodo}
                  style={{ marginLeft: symbols.spacing._16 }}
                />
              </SectionHeading>
              <SectionContent>
                {todos.map((todo) => (
                  <TouchableOpacity
                    key={todo.id}
                    onPress={() =>
                      manageTodoRoute.navigateTo(navigation, {
                        ...todo,
                        plantId: todo.plantId,
                        todoId: todo.id,
                      })
                    }
                  >
                    <ListItem title={todo.title} />
                  </TouchableOpacity>
                ))}
              </SectionContent>
            </>
          ),
        ),
      )}
    </ScreenLayout>
  );
};

type PlantRouteParams = {
  plantId: string;
};

export const plantRoute = makeNavigationRoute<PlantRouteParams>({
  screen: PlantScreen,
  stackName: PLANTS_STACK_NAME,
  routeName: "PLANT_SCREEN",
  defaultParams: {
    plantId: "",
  },
});

const SectionHeading = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: ${symbols.spacing._16}px;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;

const SectionContent = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;
