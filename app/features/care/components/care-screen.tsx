import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback, useMemo, useState } from "react";
import { SectionList, View } from "react-native";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { Icon } from "../../../components/icon";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { PlantListItem } from "../../../components/plant-list-item";
import { TouchableOpacity } from "../../../components/touchable-opacity";
import { Heading, SubHeading } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { runWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { selectCurrentUserId } from "../../auth/store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import {
  groupTodosByType,
  selectDueTodos,
  selectTodosAndPlantsByIds,
} from "../../todos/store/state";
import { createCaresForPlant } from "../store/effects";

export const CareScreen = () => {
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );

  const [doneTodoIds, setDoneTodos] = useState<string[]>([]);

  const profileId_ = useStore(selectCurrentUserId);

  const profileId = pipe(
    profileId_,
    O.getOrElse(() => ""),
  );

  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );

  const todoIds = useStore(selectDueTodos(selectedHouseholdId));

  const todos = useStore(
    () => selectTodosAndPlantsByIds(selectedHouseholdId)(todoIds),
    [selectedHouseholdId, todoIds.join("")],
  );

  const todosGroups = useMemo(() => groupTodosByType()(todos), [todos]);

  const toggleTodoDone = useCallback(
    (todoId: string) =>
      setDoneTodos((current) =>
        current.includes(todoId)
          ? current.filter((id) => id !== todoId)
          : [...new Set([...current, todoId])],
      ),
    [],
  );

  const submit = useCallback(() => {
    const todosToSave = todos.filter((todo) => doneTodoIds.includes(todo.id));
    if (todosToSave.length === 0) {
      return;
    }
    runWithUIState(
      pipe(
        createCaresForPlant(selectedHouseholdId)(profileId)(
          todosToSave.map(({ id: todoId, plantId }) => ({ plantId, todoId })),
        ),
      ),
    );
  }, [doneTodoIds]);

  return (
    <ScreenLayout
      footer={
        <Footer>
          <Button large onPress={submit}>
            Done
          </Button>
        </Footer>
      }
    >
      <SectionList
        style={{
          flex: 1,
          paddingTop: symbols.spacing.appVertical,
        }}
        ListHeaderComponent={
          <WelcomeMessage>
            👋 You have {todoIds.length} thing{todoIds.length > 1 ? "s" : ""} to
            do.
          </WelcomeMessage>
        }
        sections={todosGroups}
        renderSectionHeader={({ section: { title } }) => (
          <View style={{ paddingHorizontal: symbols.spacing.appHorizontal }}>
            <SectionHeading weight="bold">{title}</SectionHeading>
          </View>
        )}
        renderItem={({ item: todo }) => (
          <TouchableOpacity
            onPress={() => toggleTodoDone(todo.id)}
            key={todo.id}
            style={{ paddingHorizontal: symbols.spacing.appHorizontal }}
          >
            {pipe(
              todo.plant,
              O.fold(
                () => null,
                (plant) => {
                  const isDone = doneTodoIds.includes(todo.id);
                  return (
                    <PlantListItem
                      plant={plant}
                      right={
                        <Icon
                          icon={isDone ? "check-square" : "square"}
                          size={36}
                          color={
                            isDone
                              ? symbols.colors.darkGreen
                              : symbols.colors.deepGray
                          }
                        />
                      }
                    />
                  );
                },
              ),
            )}
          </TouchableOpacity>
        )}
      ></SectionList>
    </ScreenLayout>
  );
};

const WelcomeMessage = styled(Heading)`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  margin-bottom: ${symbols.spacing.appHorizontal * 2}px;
`;

const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;

const SectionHeading = styled(SubHeading)`
  padding-top: ${symbols.spacing._20}px;
  padding-bottom: ${symbols.spacing._12}px;
  background-color: ${(props) => props.theme.appBackground};
`;

export const careRoute = makeNavigationRoute({
  screen: CareScreen,
  routeName: "CARE_SCREEN",
});
