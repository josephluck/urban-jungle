import { StackScreenProps } from "@react-navigation/stack";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback, useMemo, useState } from "react";
import { SectionList, View } from "react-native";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { Icon } from "../../../components/icon";
import {
  Footer,
  ScreenLayout,
} from "../../../components/layouts/screen-layout";
import { PlantListItem } from "../../../components/plant-list-item";
import { TouchableOpacity } from "../../../components/touchable-opacity";
import { Heading, SubHeading } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { HOME_STACK_NAME } from "../../../navigation/stack-names";
import { updateTodosLastDone } from "../../../store/effects";
import {
  groupTodosByType,
  selectCurrentUserId,
  selectDueTodos,
  selectedSelectedOrMostRecentHouseholdId,
  selectTodosAndPlantsByIds,
} from "../../../store/selectors";
import { useStore } from "../../../store/state";
import { runWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { manageRoute } from "../../manage/components/manage-screen";
import { plantsRoute } from "../../plants/components/plants-screen";

export const CareScreen = ({ navigation }: StackScreenProps<{}>) => {
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
      pipe(updateTodosLastDone(selectedHouseholdId)(profileId)(todosToSave)),
    );
  }, [doneTodoIds]);

  return (
    <ScreenLayout scrollView={false} isRootScreen>
      <SectionList
        style={{
          flex: 1,
        }}
        ListHeaderComponent={
          <>
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: symbols.spacing.appHorizontal,
                marginVertical: symbols.spacing.appVertical,
              }}
            >
              <Button
                onPress={() => plantsRoute.navigateTo(navigation, {})}
                style={{ marginRight: symbols.spacing._6 }}
              >
                Plants
              </Button>
              <Button onPress={() => manageRoute.navigateTo(navigation, {})}>
                Settings
              </Button>
            </View>
            <WelcomeMessage>
              {todoIds.length ? (
                <>
                  👋 You have {todoIds.length} thing
                  {todoIds.length > 1 ? "s" : ""} to do.
                </>
              ) : (
                <>🎉 You're all done!</>
              )}
            </WelcomeMessage>
          </>
        }
        ListFooterComponent={
          <Footer>
            <Button large onPress={submit}>
              Done
            </Button>
          </Footer>
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
  margin-bottom: ${symbols.spacing._20}px;
`;

const SectionHeading = styled(SubHeading)`
  padding-top: ${symbols.spacing._20}px;
  padding-bottom: ${symbols.spacing._12}px;
  background-color: ${(props) => props.theme.appBackground};
`;

export const careRoute = makeNavigationRoute({
  screen: CareScreen,
  stackName: HOME_STACK_NAME,
  routeName: "CARE_SCREEN",
});
