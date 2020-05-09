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
import { makeImageModel } from "../../../models/image";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { sortByMostRecent } from "../../../utils/sort";
import { selectCaresForPlant } from "../../care/store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { takeAndUploadPicture } from "../../photos/camera";
import { createManageTodoRoute } from "../../todos/components/manage-todo-screen";
import { createTodoRoute } from "../../todos/components/todo-screen";
import { selectTodosForPlant } from "../../todos/store/state";
import { deletePlantByHouseholdId, savePlantImage } from "../store/effects";
import {
  selectMostLovedByForPlant,
  selectPlantByHouseholdId,
} from "../store/state";
import { HouseholdPlantsPhotosSubscription } from "../subscriptions/plant-photos";
import { managePlantRoute } from "./manage-plant-screen";

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

  const handleEdit = useCallback(() => {
    managePlantRoute.navigateTo(navigation, {
      plantId,
      name: pipe(
        plant,
        O.map((plant) => plant.name),
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
    navigation.navigate(
      createManageTodoRoute({
        plantId,
      })
    );
  }, [plantId]);

  const handleDelete = useCallback(() => {
    navigation.goBack();
    deletePlantByHouseholdId(selectedHouseholdId)(plantId)();
  }, [plantId, selectedHouseholdId]);

  const handleTakePicture = useCallback(() => {
    pipe(
      takeAndUploadPicture("plant"),
      TE.chain((value) =>
        savePlantImage(selectedHouseholdId, plantId, O.some(value))
      )
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
              <HouseholdPlantsPhotosSubscription
                plantId={plantId}
                householdId={plant.householdId}
              />
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
                      navigation.navigate(
                        createTodoRoute(todo.plantId, todo.id)
                      )
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
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;

const SectionContent = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;
