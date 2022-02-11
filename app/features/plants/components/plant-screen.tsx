import { StackScreenProps } from "@react-navigation/stack";
import { makeImageModel } from "@urban-jungle/shared/models/image";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback, useMemo } from "react";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { launchCameraAndTakePicture } from "../../../components/camera";
import {
  ContextMenuDotsButton,
  ContextMenuIconButton,
  useContextMenu,
} from "../../../components/context-menu";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { ListItem } from "../../../components/list-item";
import { PlantImageCarousel } from "../../../components/plant-image-carousel";
import { PlantNameAndLocation } from "../../../components/plant-name-and-location";
import { TouchableOpacity } from "../../../components/touchable-opacity";
import { SubHeading } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { UIEffect, useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { uploadPhoto } from "../../photos/storage";
import { manageTodoRoute } from "../../todos/components/manage-todo-screen";
import { selectTodosForPlant } from "../../todos/store/state";
import { deletePlantByHouseholdId, savePlantImage } from "../store/effects";
import { getPlantName, selectPlantByHouseholdId } from "../store/state";
import { managePlantRoute } from "./manage-plant-screen";

export const PlantScreen = ({
  navigation,
  route,
}: StackScreenProps<Record<keyof PlantRouteParams, undefined>>) => {
  const runWithUIState = useRunWithUIState();
  const { hide: hideContextMenu } = useContextMenu();
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

  const handleDelete = useCallback(
    () =>
      runWithUIState(
        pipe(
          deletePlantByHouseholdId(selectedHouseholdId)(plantId),
          TE.map(navigation.goBack),
        ),
      ),
    [plantId, selectedHouseholdId],
  );

  const handleTakePicture = useCallback(() => {
    hideContextMenu();
    pipe(
      launchCameraAndTakePicture(),
      TE.map(UIEffect.start),
      TE.chain(uploadPhoto("plant")),
      TE.chain((imageInfo) =>
        savePlantImage(selectedHouseholdId, plantId, O.some(imageInfo)),
      ),
      TE.map(UIEffect.right),
      TE.mapLeft(UIEffect.left),
    )();
  }, [plantId, selectedHouseholdId]);

  const plantName = useMemo(
    () =>
      pipe(
        plant,
        O.map(getPlantName),
        O.getOrElse(() => "Unknown"),
      ),
    [plant],
  );

  return (
    <ScreenLayout
      onBack={navigation.goBack}
      stickyHeaderIndices={stickyHeaderIndices}
      headerRightButton={
        <ContextMenuDotsButton menuId="plant-screen">
          {[
            <ContextMenuIconButton icon="camera" onPress={handleTakePicture}>
              Snap {plantName}
            </ContextMenuIconButton>,
            <ContextMenuIconButton icon="trash" onPress={handleDelete}>
              Delete {plantName}
            </ContextMenuIconButton>,
            <ContextMenuIconButton icon="edit-3" onPress={handleEdit}>
              Edit {plantName}
            </ContextMenuIconButton>,
          ]}
        </ContextMenuDotsButton>
      }
    >
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
              <PlantImageCarousel
                householdId={selectedHouseholdId}
                plantId={plantId}
              />
              <SectionHeading>
                <SubHeading weight="bold">Todos</SubHeading>
                <Button
                  onPress={handleAddNewTodo}
                  style={{ marginLeft: symbols.spacing._16 }}
                >
                  Add
                </Button>
              </SectionHeading>
              <SectionContent>
                {todos.map((todo) => (
                  <TouchableOpacity
                    key={todo.id}
                    onPress={() =>
                      manageTodoRoute.navigateTo(navigation, {
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
