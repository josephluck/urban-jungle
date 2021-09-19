import { StackScreenProps } from "@react-navigation/stack";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback, useMemo, useState } from "react";
import { SectionList } from "react-native";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { Icon } from "../../../components/icon";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
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
  selectTodosAndPlantsByIds,
} from "../../todos/store/state";
import { createCaresForPlant } from "../store/effects";
import { careRoute } from "./care-screen";

export const CareSessionScreen = ({
  navigation,
  route,
}: StackScreenProps<Record<keyof CareSessionParams, undefined>>) => {
  const { todoIds = [] } = careSessionRoute.getParams(route);

  const [doneTodoIds, setDoneTodos] = useState<string[]>([]);

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );

  const profileId_ = useStore(selectCurrentUserId);

  const profileId = pipe(
    profileId_,
    O.getOrElse(() => ""),
  );

  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );

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
      careRoute.navigateTo(navigation, {});
      return;
    }
    runWithUIState(
      pipe(
        createCaresForPlant(selectedHouseholdId)(profileId)(
          todosToSave.map(({ id: todoId, plantId }) => ({ plantId, todoId })),
        ),
        TE.map(() => careRoute.navigateTo(navigation, {})),
      ),
    );
  }, [doneTodoIds]);

  return (
    <BackableScreenLayout
      onBack={() => navigation.goBack()}
      scrollView={false}
      footer={
        <Footer>
          <Button large onPress={submit}>
            Done
          </Button>
        </Footer>
      }
    >
      <ContentContainer>
        <SectionList
          style={{ flex: 1 }}
          ListHeaderComponent={
            <WelcomeMessage>
              👋 You have {todoIds.length} thing{todoIds.length > 1 ? "s" : ""}{" "}
              to do.
            </WelcomeMessage>
          }
          sections={todosGroups}
          renderSectionHeader={({ section: { title } }) => (
            <SectionHeading weight="bold">{title}</SectionHeading>
          )}
          renderItem={({ item: todo }) => (
            <TouchableOpacity
              onPress={() => toggleTodoDone(todo.id)}
              key={todo.id}
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
      </ContentContainer>
    </BackableScreenLayout>
  );
};

type CareSessionParams = {
  todoIds: string[];
};

export const careSessionRoute = makeNavigationRoute<CareSessionParams>({
  screen: CareSessionScreen,
  routeName: "CARE_SESSION_SCREEN",
  defaultParams: {
    todoIds: [],
  },
  serializeParams: (params) => ({
    ...params,
    todoIds: JSON.stringify(params.todoIds ? params.todoIds : []),
  }),
  deserializeParams: (params) => ({
    ...params,
    todoIds: deserializeStringArray(params.todoIds),
  }),
});

const deserializeStringArray = (monthsStr: string) => {
  try {
    if (monthsStr) {
      const parsed = JSON.parse(monthsStr);
      return Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "string")
        ? parsed
        : [];
    }
    return [];
  } catch (err) {
    return [];
  }
};

const WelcomeMessage = styled(Heading)`
  margin-bottom: ${symbols.spacing._12}px;
`;

const ContentContainer = styled.View`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
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
