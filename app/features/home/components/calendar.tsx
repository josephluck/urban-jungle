import React, { useMemo, useRef, useCallback, useState } from "react";
import moment from "moment";
import styled from "styled-components/native";
import Carousel, { CarouselStatic } from "react-native-snap-carousel";
import { BodyText } from "../../../components/typography";
import { symbols } from "../../../theme";
import { Dimensions, ScrollView } from "react-native";
import { ListItem } from "../../../components/list-item";
import { selectTodosSchedule } from "../../todos/store/state";
import { useStore } from "../../../store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { TouchableOpacity } from "react-native-gesture-handler";
import { createCareForPlant } from "../../care/store/effects";
import { selectCurrentUserId } from "../../auth/store/state";

export const Calendar = (_props: { householdId: string }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const carouselRef = useRef<CarouselStatic<any>>(null);
  // const numberOfDays = 15; // NB: 1 week either side of today
  // const todaysIndex = Math.floor(numberOfDays / 2);
  const today = moment();
  // const earliestDate = useMemo(
  //   () => today.clone().subtract(todaysIndex, "days"),
  //   [today, numberOfDays]
  // );
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );
  const _profileId = useStore(selectCurrentUserId);
  const profileId = pipe(
    _profileId,
    O.getOrElse(() => "")
  );
  const schedule = useStore(() => selectTodosSchedule(selectedHouseholdId)(7), [
    selectedHouseholdId,
  ]);

  const days = schedule.map((day, index) => ({
    ...day,
    index,
    isPast: false,
    isToday: index === 0,
  }));
  const [activeMonth, setActiveMonth] = useState(() => today.format("MMMM"));

  const windowWidth = useMemo(() => Dimensions.get("window").width, []);

  const snapDaysToIndex = useCallback(
    (index: number) => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: 0,
          x: index * dayOverallSize,
          animated: true,
        });
      }
    },
    [scrollViewRef.current]
  );

  const snapCarouselToIndex = useCallback(
    (index: number) => {
      if (carouselRef.current) {
        carouselRef.current.snapToItem(index, true);
      }
    },
    [carouselRef.current]
  );

  const handleDayPress = useCallback(
    (index: number, date: moment.Moment) => {
      snapCarouselToIndex(index);
      snapDaysToIndex(index);
      if (date.format("MMMM") !== activeMonth) {
        setActiveMonth(date.format("MMMM"));
      }
    },
    [snapCarouselToIndex, snapDaysToIndex, setActiveMonth, activeMonth]
  );

  const handleCarouselIndexChange = useCallback(
    (index: number) => {
      snapDaysToIndex(index);
      const date = days[index].date;
      if (date.format("MMMM") !== activeMonth) {
        setActiveMonth(date.format("MMMM"));
      }
    },
    [days, snapDaysToIndex, activeMonth]
  );

  return (
    <Container>
      <MonthText weight="semibold">{activeMonth}</MonthText>
      <DaysContainer
        horizontal
        snapToInterval={dayOverallSize}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: windowWidth - dayOverallSize,
          backgroundColor: symbols.colors.appBackground,
        }}
        ref={scrollViewRef}
        removeClippedSubviews
      >
        {days.map((day) => (
          <Day
            key={day.date.toISOString()}
            onPress={() => handleDayPress(day.index, day.date)}
            isPast={day.isPast}
            isToday={day.isToday}
            activeOpacity={0.8}
          >
            <DayText weight="semibold" isToday={day.isToday}>
              {day.date.date()}
            </DayText>
          </Day>
        ))}
      </DaysContainer>
      <Carousel
        data={days}
        // firstItem={todaysIndex}
        sliderWidth={windowWidth}
        itemWidth={windowWidth}
        nestedScrollEnabled
        inactiveSlideScale={1}
        inactiveSlideOpacity={1}
        onBeforeSnapToItem={handleCarouselIndexChange}
        renderItem={(slide) => {
          const date = slide.item.date.toISOString();
          return (
            <TodosList key={date}>
              {slide.item.todos.map((todo) => (
                <TouchableOpacity
                  key={`${date}-${todo.id}`}
                  onPress={() => {
                    createCareForPlant(profileId)(todo.id)(todo.plantId)(
                      todo.householdId
                    )();
                  }}
                >
                  <ListItem
                    title={todo.title}
                    detail={`${todo.detail} every ${todo.recurrenceDays} days.`}
                  />
                </TouchableOpacity>
              ))}
            </TodosList>
          );
        }}
        ref={carouselRef as any}
      />
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
`;

const MonthText = styled(BodyText)`
  padding-horizontal: ${symbols.spacing.appHorizontal};
  margin-bottom: ${symbols.spacing._8};
`;

const DaysContainer = styled.ScrollView`
  flex-grow: 0;
  padding-horizontal: ${symbols.spacing.appHorizontal};
  background-color: ${symbols.colors.appBackground};
  margin-bottom: ${symbols.spacing._20};
`;

const daySize = 50;
const dayGap = symbols.spacing._8;
const dayOverallSize = daySize + dayGap;

const Day = styled.TouchableOpacity<{ isPast: boolean; isToday: boolean }>`
  width: ${daySize};
  height: ${daySize};
  background-color: ${(props) =>
    props.isToday ? "transparent" : symbols.colors.nearWhite};
  border-color: ${symbols.colors.solidBlue};
  border-width: ${(props) => (props.isToday ? 2 : 0)};
  opacity: ${(props) => (props.isPast ? 0.5 : 1)};
  justify-content: center;
  align-items: center;
  margin-right: ${dayGap};
  border-radius: ${symbols.borderRadius.tiny};
`;

const DayText = styled(BodyText)<{ isToday: boolean }>`
  color: ${(props) =>
    props.isToday ? symbols.colors.solidBlue : symbols.colors.offBlack};
`;

const TodosList = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal};
`;
