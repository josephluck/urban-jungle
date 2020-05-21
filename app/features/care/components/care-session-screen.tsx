import { TodoModel } from "@urban-jungle/shared/models/todo";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dimensions, ScrollView } from "react-native";
import Carousel, { CarouselStatic } from "react-native-snap-carousel";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { TodoOverview } from "../../../components/todo-overview";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { selectCurrentUserId } from "../../auth/store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import {
  selectTodosAndPlantsByIds,
  sortTodosByLocationAndPlant,
} from "../../todos/store/state";
import { createCareForPlant } from "../store/effects";
import { careRoute } from "./care-screen";

export const CareSessionScreen = ({
  navigation,
}: NavigationStackScreenProps) => {
  const { todoIds = [] } = careSessionRoute.getParams(navigation);

  const [doneTodoIds, setDoneTodos] = useState<string[]>([]);

  const carouselRef = useRef<CarouselStatic<any>>(null);

  const windowWidth = useMemo(() => Dimensions.get("window").width, []);

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );

  const profileId_ = useStore(selectCurrentUserId);

  const profileId = pipe(
    profileId_,
    O.getOrElse(() => "")
  );

  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );

  const todos = useStore(
    () =>
      selectTodosAndPlantsByIds(selectedHouseholdId)(todoIds).sort(
        sortTodosByLocationAndPlant
      ),
    [selectedHouseholdId, todoIds.join("")]
  );

  /**
   * Keeps a mutable ref of the done todos for fresh-access in the effect that
   * keeps the carousel in sync with the next not-done todo
   */
  const doneTodoIdsRef = useRef<string[]>([]);
  doneTodoIdsRef.current = doneTodoIds;

  /**
   * Keeps a mutable ref of the list of todo ids in order that they are
   * displayed in the carousel. Used to navigate between todos in the carousel
   * when the user has done or skipped a todo
   */
  const carouselTodoIdsRef = useRef<string[]>([]);
  carouselTodoIdsRef.current = todos.map((todo) => todo.id);

  /**
   * When the list of done todos changes, navigate to the next not-done todo.
   */
  useEffect(() => {
    const indexOfNextTodo = carouselTodoIdsRef.current.findIndex(
      (todoId) => !doneTodoIdsRef.current.includes(todoId)
    );
    requestAnimationFrame(() => {
      if (indexOfNextTodo > -1) {
        snapCarouselToIndex(indexOfNextTodo);
      } else if (
        doneTodoIdsRef.current.length === carouselTodoIdsRef.current.length
      ) {
        careRoute.navigateTo(navigation, {});
      }
    });
  }, [doneTodoIds.length]);

  const snapCarouselToIndex = useCallback((index: number) => {
    if (carouselRef.current) {
      carouselRef.current.snapToItem(index, true);
    }
  }, []);

  const markTodoAsDone = useCallback(
    (todoId: string) =>
      setDoneTodos((current) => [...new Set([...current, todoId])]),
    []
  );

  const completeTodo = useCallback(
    (todo: TodoModel) => {
      markTodoAsDone(todo.id);
      createCareForPlant(profileId)(todo.id)(todo.plantId)(todo.householdId)();
    },
    [markTodoAsDone, profileId]
  );

  const skipTodo = useCallback((todo: TodoModel) => markTodoAsDone(todo.id), [
    markTodoAsDone,
  ]);

  return (
    <BackableScreenLayout onBack={() => navigation.goBack()}>
      <Carousel
        style={{ flex: 1 }}
        containerCustomStyle={{ flex: 1 }}
        data={todos}
        removeClippedSubviews
        sliderWidth={windowWidth}
        itemWidth={windowWidth}
        nestedScrollEnabled
        inactiveSlideScale={1}
        inactiveSlideOpacity={1}
        renderItem={(slide) => {
          const todoIsDone = doneTodoIds.includes(slide.item.id);
          return (
            <Slide key={slide.item.id}>
              <ScrollView
                style={{
                  flex: 1,
                  paddingHorizontal: symbols.spacing.appHorizontal,
                }}
              >
                {pipe(
                  slide.item.plant,
                  O.fold(
                    () => null,
                    (plant) => <TodoOverview plant={plant} todo={slide.item} />
                  )
                )}
              </ScrollView>
              <Footer>
                <SkipButton
                  type="plain"
                  onPress={() => skipTodo(slide.item)}
                  disabled={todoIsDone}
                >
                  Skip
                </SkipButton>
                <Button
                  onPress={() => completeTodo(slide.item)}
                  disabled={todoIsDone}
                  large
                >
                  It's done
                </Button>
              </Footer>
            </Slide>
          );
        }}
        ref={carouselRef as any}
      />
    </BackableScreenLayout>
  );
};

export const careSessionRoute = makeNavigationRoute<{
  todoIds: string[];
}>({
  screen: CareSessionScreen,
  routeName: "CARE_SESSION_SCREEN",
  authenticated: true,
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
  console.log({ monthsStr });
  try {
    if (monthsStr) {
      const parsed = JSON.parse(monthsStr);
      return Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "string")
        ? parsed
        : [];
    } else {
      return [];
    }
  } catch (err) {
    return [];
  }
};

const Slide = styled.View`
  flex: 1;
`;

const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;

const SkipButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8}px;
`;
