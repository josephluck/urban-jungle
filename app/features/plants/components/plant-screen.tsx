import { makeImageModel } from "@urban-jungle/shared/models/image";
import { sortByMostRecent } from "@urban-jungle/shared/utils/sort";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import moment from "moment";
import React, { useCallback, useMemo } from "react";
import { TouchableOpacity } from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { ContextMenuButton } from "../../../components/context-menu";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { ListItem } from "../../../components/list-item";
import { PlantImageCarousel } from "../../../components/plant-image-carousel";
import { PlantNameAndLocation } from "../../../components/plant-name-and-location";
import { SubHeading } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { UIEffect } from "../../../store/ui";
import { symbols } from "../../../theme";
import { selectCaresForPlant } from "../../care/store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { takePicture } from "../../photos/camera";
import { uploadPhoto } from "../../photos/storage";
import { manageTodoRoute } from "../../todos/components/manage-todo-screen";
import { todoRoute } from "../../todos/components/todo-screen";
import { selectTodosForPlant } from "../../todos/store/state";
import { deletePlantByHouseholdId, savePlantImage } from "../store/effects";
import {
  selectMostLovedByForPlant,
  selectPlantByHouseholdId,
} from "../store/state";
import { managePlantRoute } from "./manage-plant-screen";

export const PlantScreen = ({ navigation }: NavigationStackScreenProps) => {
  const { plantId } = plantRoute.getParams(navigation);

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

  const handleEdit = useCallback(() => {
    managePlantRoute.navigateTo(navigation, {
      plantId,
      name: pipe(
        plant,
        O.map((plant) => plant.name),
        O.getOrElse(() => "")
      ),
      nickname: pipe(
        plant,
        O.map((plant) => plant.nickname),
        O.getOrElse(() => "")
      ),
      location: pipe(
        plant,
        O.chain((plant) => O.fromNullable(plant.location)),
        O.getOrElse(() => "")
      ),
      avatar: pipe(
        plant,
        O.chain((plant) => O.fromNullable(plant.avatar)),
        O.getOrElse(() => makeImageModel())
      ),
    });
  }, [plantId, plant]);

  const handleAddNewTodo = useCallback(() => {
    manageTodoRoute.navigateTo(navigation, { plantId });
  }, [plantId]);

  const handleDelete = useCallback(() => {
    navigation.goBack();
    deletePlantByHouseholdId(selectedHouseholdId)(plantId)();
  }, [plantId, selectedHouseholdId]);

  const handleTakePicture = useCallback(() => {
    pipe(
      takePicture(),
      TE.map(UIEffect.start),
      TE.chain(uploadPhoto("plant")),
      TE.chain((imageInfo) =>
        savePlantImage(selectedHouseholdId, plantId, O.some(imageInfo))
      ),
      TE.map(UIEffect.right),
      TE.mapLeft(UIEffect.left)
    )();
  }, [plantId, selectedHouseholdId]);

  const plantName = useMemo(
    () =>
      pipe(
        plant,
        O.map((p) => p.name),
        O.getOrElse(() => "plant")
      ),
    [plant]
  );

  return (
    <BackableScreenLayout
      onBack={handleGoBack}
      stickyHeaderIndices={stickyHeaderIndices}
      headerRightButton={
        <ContextMenuButton
          buttons={[
            {
              icon: "camera",
              label: `Snap ${plantName}`,
              onPress: handleTakePicture,
            },
            {
              icon: "trash",
              label: `Delete ${plantName}`,
              onPress: handleDelete,
            },
            { icon: "edit-3", label: `Edit ${plantName}`, onPress: handleEdit },
          ]}
        />
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
                  name={plant.name}
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
                      todoRoute.navigateTo(navigation, {
                        plantId: todo.plantId,
                        todoId: todo.id,
                      })
                    }
                  >
                    <ListItem title={todo.title} />
                  </TouchableOpacity>
                ))}
              </SectionContent>
              {pipe(
                mostLovedBy,
                O.fold(
                  () => null,
                  (profile) => [
                    <SectionHeading key="most-loved-by-heading">
                      <SubHeading weight="bold">Most loved by</SubHeading>
                    </SectionHeading>,
                    <SectionContent key="most-loved-by">
                      <ListItem title={profile.name} image={profile.avatar} />
                    </SectionContent>,
                  ]
                )
              )}
              <SectionHeading>
                <SubHeading weight="bold">History</SubHeading>
              </SectionHeading>
              <SectionContent>
                {cares.map((care) => (
                  <ListItem
                    key={care.id}
                    image={care.profile.avatar}
                    title={care.todo.title}
                    detail={`By ${care.profile.name} on ${moment(
                      care.dateCreated.toDate()
                    ).format("Do MMM YY")}`}
                  />
                ))}
              </SectionContent>
            </>
          )
        )
      )}
    </BackableScreenLayout>
  );
};

export const plantRoute = makeNavigationRoute<{
  plantId: string;
}>({
  screen: PlantScreen,
  routeName: "PLANT_SCREEN",
  authenticated: true,
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
