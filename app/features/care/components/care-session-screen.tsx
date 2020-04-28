import React, { useCallback, useMemo, useState } from "react";
import { ScreenLayout } from "../../../components/screen-layout";
import {
  selectHasAuthenticated,
  selectCurrentUserId,
} from "../../auth/store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { useStore } from "../../../store/state";
import styled from "styled-components/native";
import { symbols } from "../../../theme";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { TouchableIcon } from "../../../components/touchable-icon";
import { createCareForPlant } from "../store/effects";
import { useRef } from "react";
import Carousel, { CarouselStatic } from "react-native-snap-carousel";
import { selectTodosAndPlantsByIds } from "../../todos/store/state";
import * as TE from "fp-ts/lib/TaskEither";
import { Dimensions } from "react-native";
import { ScrollView } from "react-native";
import { createCareRoute } from "../navigation/routes";
import { TodoModel } from "../../../models/todo";
import { IconButton } from "../../../components/icon-button";
import {
  BodyText,
  SubHeading,
  Heading,
  Paragraph,
} from "../../../components/typography";

export const CareSession = (props: NavigationStackScreenProps) => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <CareSessionScreen {...props} />;
  }

  return null;
};

const CareSessionScreen = ({ navigation }: NavigationStackScreenProps) => {
  const todoIds: string[] = navigation.getParam(TODO_IDS);
  const [doneTodos, setDoneTodos] = useState<string[]>([]);
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
    () => selectTodosAndPlantsByIds(selectedHouseholdId)(todoIds),
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
      const nextDoneTodos = [...new Set([...doneTodos, todoId])];
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
    [snapCarouselToIndex, todoIds, doneTodos]
  );

  const handleTodoDone = useCallback(
    (todo: TodoModel) => {
      pipe(
        createCareForPlant(profileId)(todo.id)(todo.plantId)(todo.householdId),
        TE.map(() => goToNextNotDoneTodo(todo.id)())
      )();
    },
    [goToNextNotDoneTodo, profileId]
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
          sliderWidth={windowWidth}
          itemWidth={windowWidth}
          nestedScrollEnabled
          inactiveSlideScale={1}
          inactiveSlideOpacity={1}
          renderItem={(slide) => (
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
                      <>
                        <PlantNameWrapper>
                          <SubHeading>{plant.name}</SubHeading>
                          {plant.location ? (
                            <Label>
                              <LabelText weight="bold">
                                {plant.location.toUpperCase()}
                              </LabelText>
                            </Label>
                          ) : null}
                        </PlantNameWrapper>
                        {plant.avatar ? (
                          <PlantImage source={{ uri: plant.avatar }} />
                        ) : (
                          <PlantImagePlaceholder />
                        )}
                      </>
                    )
                  )
                )}
                <Spacer />
                <Heading style={{ marginBottom: 20 }}>
                  {slide.item.title}
                </Heading>
                <Paragraph>{slide.item.detail}</Paragraph>
              </ScrollView>
              <ButtonWrapper>
                <IconButton
                  onPress={() => handleTodoDone(slide.item)}
                  disabled={doneTodos.includes(slide.item.id)}
                  large
                >
                  It's done
                </IconButton>
              </ButtonWrapper>
            </Slide>
          )}
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
  padding-top: ${symbols.spacing._20};
  padding-horizontal: ${symbols.spacing.appHorizontal};
  margin-bottom: ${symbols.spacing._20};
`;

const ScreenControls = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const PlantImage = styled.Image`
  border-radius: 30;
  width: 100%;
  aspect-ratio: 2;
`;

const PlantImagePlaceholder = styled.View`
  background-color: ${symbols.colors.nearWhite};
  border-radius: 30;
  width: 100%;
  aspect-ratio: 2;
`;

const Slide = styled.View`
  flex: 1;
`;

const PlantNameWrapper = styled.View`
  padding-bottom: ${symbols.spacing._20};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.View`
  margin-left: ${symbols.spacing._8};
  padding-horizontal: ${symbols.spacing._6};
  padding-vertical: ${symbols.spacing._2};
  border-radius: ${symbols.borderRadius.tiny};
  background-color: ${symbols.colors.nearWhite};
`;

const LabelText = styled(BodyText)`
  font-size: ${symbols.font._12.size};
  color: ${symbols.colors.deepGray};
`;

const Spacer = styled.View`
  margin-bottom: ${symbols.spacing._20};
`;

const ButtonWrapper = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal};
  padding-vertical: ${symbols.spacing.appHorizontal};
`;
