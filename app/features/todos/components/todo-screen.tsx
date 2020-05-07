import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import moment from "moment";
import React, { useCallback } from "react";
import { View } from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { ListItem } from "../../../components/list-item";
import { SubHeading } from "../../../components/typography";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { sortByMostRecent } from "../../../utils/sort";
import { selectCaresForTodo } from "../../care/store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import {
  selectMostLovedByForTodo,
  selectTodoByHouseholdId,
} from "../store/state";
import { createManageTodoRoute } from "./manage-todo-screen";
import { sequenceO } from "../../../fp/option";
import { selectPlantByHouseholdId } from "../../plants/store/state";
import { TodoOverview } from "../../../components/todo-overview";
import { ContextMenuButton } from "../../../components/context-menu";
import { deleteTodo } from "../store/effects";

export const TodoScreen = ({ navigation }: NavigationStackScreenProps) => {
  const todoId = navigation.getParam(TODO_ID);
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

  const todo = useStore(() =>
    selectTodoByHouseholdId(selectedHouseholdId, todoId)
  );

  const cares = useStore(
    () =>
      selectCaresForTodo(selectedHouseholdId)(todoId).sort(sortByMostRecent),
    [todoId, selectedHouseholdId]
  );

  const mostLovedBy = useStore(
    () => selectMostLovedByForTodo(selectedHouseholdId)(todoId),
    [todoId, selectedHouseholdId]
  );

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleEdit = useCallback(() => {
    pipe(
      todo,
      O.map((todoModel) => {
        navigation.navigate(
          createManageTodoRoute({
            ...todoModel,
            plantId: todoModel.plantId,
            todoId: todoModel.id,
          })
        );
      })
    );
  }, [todoId, todo]);

  const handleDelete = useCallback(() => {
    deleteTodo(todoId)(selectedHouseholdId)();
  }, [todoId, selectedHouseholdId]);

  return (
    <BackableScreenLayout
      onBack={handleGoBack}
      headerRightButton={
        <ContextMenuButton
          buttons={[
            { icon: "trash", label: "Delete todo", onPress: handleDelete },
            { icon: "edit-3", label: "Edit todo", onPress: handleEdit },
          ]}
        />
      }
    >
      <ContentContainer>
        {pipe(
          sequenceO(plant, todo),
          O.fold(
            () => null,
            ([plant, todo]) => (
              <>
                <TodoOverview plant={plant} todo={todo} />

                {pipe(
                  mostLovedBy,
                  O.fold(
                    () => null,
                    (profile) => [
                      <SectionHeading key="most-done-by-heading">
                        <SubHeading weight="bold">Most done by</SubHeading>
                      </SectionHeading>,
                      <View key="most-done-by">
                        <ListItem title={profile.name} image={profile.avatar} />
                      </View>,
                    ]
                  )
                )}
                <SectionHeading>
                  <SubHeading weight="bold">History</SubHeading>
                </SectionHeading>
                <View>
                  {cares.map((care) => (
                    <ListItem
                      key={care.id}
                      image={care.profile.avatar}
                      title={`By ${care.profile.name}`}
                      detail={`On ${moment(care.dateCreated.toDate()).format(
                        "Do MMM YY"
                      )}`}
                    />
                  ))}
                </View>
              </>
            )
          )
        )}
      </ContentContainer>
    </BackableScreenLayout>
  );
};

export const TODO_SCREEN = "TODO_SCREEN";

export const TODO_ID = "TODO_ID";

export const PLANT_ID = "PLANT_ID";

export const createTodoRoute = (plantId: string, todoId: string) => ({
  routeName: TODO_SCREEN,
  params: { [TODO_ID]: todoId, [PLANT_ID]: plantId },
});

const SectionHeading = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: ${symbols.spacing._16}px;
  background-color: ${symbols.colors.appBackground};
`;

const ContentContainer = styled.View`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;
