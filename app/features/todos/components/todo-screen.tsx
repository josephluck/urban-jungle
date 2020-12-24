import { StackScreenProps } from "@react-navigation/stack";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import moment from "moment";
import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import styled from "styled-components/native";

import { sequenceTO } from "@urban-jungle/shared/fp/option";
import { sortByMostRecent } from "@urban-jungle/shared/utils/sort";

import {
  ContextMenuDotsButton,
  ContextMenuIconButton,
} from "../../../components/context-menu";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { ListItem } from "../../../components/list-item";
import { TodoOverview } from "../../../components/todo-overview";
import { SubHeading } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { selectCaresForTodo } from "../../care/store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { selectPlantByHouseholdId } from "../../plants/store/state";
import { deleteTodo } from "../store/effects";
import {
  selectMostLovedByForTodo,
  selectTodoByHouseholdId,
} from "../store/state";
import { manageTodoRoute } from "./manage-todo-screen";

export const TodoScreen = ({
  navigation,
  route,
}: StackScreenProps<Record<keyof TodoParams, undefined>>) => {
  const { todoId, plantId } = todoRoute.getParams(route);

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

  const todo = useStore(() =>
    selectTodoByHouseholdId(selectedHouseholdId, todoId),
  );

  const cares = useStore(
    () =>
      selectCaresForTodo(selectedHouseholdId)(todoId).sort(sortByMostRecent),
    [todoId, selectedHouseholdId],
  );

  const mostLovedBy = useStore(
    () => selectMostLovedByForTodo(selectedHouseholdId)(todoId),
    [todoId, selectedHouseholdId],
  );

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleEdit = useCallback(() => {
    pipe(
      todo,
      O.map((todoModel) => {
        manageTodoRoute.navigateTo(navigation, {
          ...todoModel,
          plantId: todoModel.plantId,
          todoId: todoModel.id,
        });
      }),
    );
  }, [todoId, todo]);

  const handleDelete = useCallback(() => {
    deleteTodo(todoId)(selectedHouseholdId)();
  }, [todoId, selectedHouseholdId]);

  const todoName = useMemo(
    () =>
      pipe(
        todo,
        O.map((t) => t.title),
        O.getOrElse(() => "todo"),
      ),
    [todo],
  );

  return (
    <BackableScreenLayout
      onBack={handleGoBack}
      headerRightButton={
        <ContextMenuDotsButton menuId="todo-screen">
          {[
            <ContextMenuIconButton icon="trash" onPress={handleDelete}>
              Delete {todoName}
            </ContextMenuIconButton>,
            <ContextMenuIconButton icon="edit-3" onPress={handleEdit}>
              Edit {todoName}
            </ContextMenuIconButton>,
          ]}
        </ContextMenuDotsButton>
      }
    >
      {pipe(
        sequenceTO(plant, todo),
        O.fold(
          () => null,
          ([plant, todo]) => (
            <ContentContainer>
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
                  ],
                ),
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
                      "Do MMM YY",
                    )}`}
                  />
                ))}
              </View>
            </ContentContainer>
          ),
        ),
      )}
    </BackableScreenLayout>
  );
};

type TodoParams = {
  todoId: string;
  plantId: string;
};

export const todoRoute = makeNavigationRoute<TodoParams>({
  screen: TodoScreen,
  routeName: "TODO_SCREEN",
  defaultParams: {
    todoId: "",
    plantId: "",
  },
});

const SectionHeading = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: ${symbols.spacing._16}px;
`;

const ContentContainer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;
