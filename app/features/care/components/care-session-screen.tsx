import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import Carousel, { CarouselStatic } from "react-native-snap-carousel";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { PlantOverview } from "../../../components/plant-overview";
import { ScreenLayout } from "../../../components/screen-layout";
import { TouchableIcon } from "../../../components/touchable-icon";
import { Heading, Paragraph } from "../../../components/typography";
import { TodoModel } from "../../../models/todo";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { selectCurrentUserId } from "../../auth/store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import {
  selectTodosAndPlantsByIds,
  sortTodosByLocationAndPlant,
} from "../../todos/store/state";
import { createCareForPlant } from "../store/effects";
import { createCareRoute } from "./care-screen";

export const CareSessionScreen = ({
  navigation,
}: NavigationStackScreenProps) => {
  const todoIds: string[] = navigation.getParam(TODO_IDS);
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

  const snapCarouselToIndex = useCallback(
    (index: number) => {
      if (carouselRef.current) {
        carouselRef.current.snapToItem(index, true);
      }
    },
    [carouselRef.current]
  );

  const goToNextNotDoneTodo = useCallback(
    (todoId: string) => () => {
      const nextDoneTodos = [...new Set([...doneTodoIds, todoId])];
      setDoneTodos(nextDoneTodos);
      const indexOfNextTodo = todoIds.findIndex(
        (todoId) => !nextDoneTodos.find((id) => todoId === id)
      );
      if (indexOfNextTodo > -1) {
        snapCarouselToIndex(indexOfNextTodo);
      } else {
        navigation.navigate(createCareRoute());
      }
    },
    [snapCarouselToIndex, todoIds, doneTodoIds]
  );

  const handleTodoDone = useCallback(
    (todo: TodoModel) => {
      goToNextNotDoneTodo(todo.id)();
      createCareForPlant(profileId)(todo.id)(todo.plantId)(todo.householdId)();
    },
    [goToNextNotDoneTodo, profileId]
  );

  const handleTodoSkipped = useCallback(
    (todo: TodoModel) => {
      goToNextNotDoneTodo(todo.id)();
    },
    [goToNextNotDoneTodo]
  );

  return (
    <ScreenLayout>
      <ScreenContainer>
        <Header>
          <ScreenControls>
            <TouchableIcon
              onPress={() => navigation.goBack()}
              style={{ marginRight: symbols.spacing._12 }}
              icon="arrow-left"
            />
          </ScreenControls>
        </Header>
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
                  style={{ flex: 1 }}
                  contentContainerStyle={{
                    paddingHorizontal: symbols.spacing.appHorizontal,
                  }}
                >
                  {pipe(
                    slide.item.plant,
                    O.fold(
                      () => null,
                      (plant) => (
                        <PlantOverview
                          name={plant.name}
                          location={plant.location}
                          avatar={plant.avatar}
                        />
                      )
                    )
                  )}
                  <Spacer />
                  <Heading style={{ marginBottom: 20 }}>
                    {slide.item.title}
                  </Heading>
                  <Paragraph>{slide.item.detail}</Paragraph>
                </ScrollView>
                <Footer>
                  <SkipButton
                    type="plain"
                    onPress={() => handleTodoSkipped(slide.item)}
                    disabled={todoIsDone}
                    large
                  >
                    Skip
                  </SkipButton>
                  <Button
                    onPress={() => handleTodoDone(slide.item)}
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
      </ScreenContainer>
    </ScreenLayout>
  );
};

export const CARE_SESSION_SCREEN = "CARE_SESSION_SCREEN";
export const TODO_IDS = "TODO_IDS";
export const createCareSessionRoute = (todoIds: string[]) => ({
  routeName: CARE_SESSION_SCREEN,
  params: { [TODO_IDS]: todoIds },
});

const ScreenContainer = styled.View`
  flex-grow: 1;
  background-color: ${symbols.colors.appBackground};
`;

const Header = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal};
  margin-vertical: ${symbols.spacing._20};
`;

const ScreenControls = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Slide = styled.View`
  flex: 1;
`;

const Spacer = styled.View`
  margin-bottom: ${symbols.spacing._20};
`;

const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal};
  padding-vertical: ${symbols.spacing.appHorizontal};
`;

const SkipButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8};
`;
