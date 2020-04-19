import React, { useMemo, useRef, useCallback, useState } from "react";
import moment from "moment";
import styled from "styled-components/native";
import Carousel, { CarouselStatic } from "react-native-snap-carousel";
import { BodyText } from "../../../components/typography";
import { symbols } from "../../../theme";
import { Dimensions, ScrollView } from "react-native";

const todos = (prefix: number) => [
  {
    id: `${prefix}-1`,
    thing: `${prefix} Water`,
  },
  {
    id: `${prefix}-2`,
    thing: `${prefix} Water`,
  },
  {
    id: `${prefix}-3`,
    thing: `${prefix} Prune`,
  },
  {
    id: `${prefix}-4`,
    thing: `${prefix} Feed`,
  },
  {
    id: `${prefix}-5`,
    thing: `${prefix} Water`,
  },
  {
    id: `${prefix}-6`,
    thing: `${prefix} Water`,
  },
  {
    id: `${prefix}-7`,
    thing: `${prefix} Prune`,
  },
  {
    id: `${prefix}-8`,
    thing: `${prefix} Feed`,
  },
  {
    id: `${prefix}-9`,
    thing: `${prefix} Water`,
  },
  {
    id: `${prefix}-10`,
    thing: `${prefix} Water`,
  },
  {
    id: `${prefix}-11`,
    thing: `${prefix} Prune`,
  },
  {
    id: `${prefix}-12`,
    thing: `${prefix} Feed`,
  },
  {
    id: `${prefix}-13`,
    thing: `${prefix} Water`,
  },
  {
    id: `${prefix}-14`,
    thing: `${prefix} Water`,
  },
  {
    id: `${prefix}-15`,
    thing: `${prefix} Prune`,
  },
  {
    id: `${prefix}-16`,
    thing: `${prefix} Feed`,
  },
];

export const Calendar = (_props: { householdId: string }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const carouselRef = useRef<CarouselStatic<any>>(null);
  const numberOfDays = 15; // NB: 1 week either side of today
  const todaysIndex = Math.floor(numberOfDays / 2);
  const today = useMemo(() => moment(), []);
  const earliestDate = useMemo(
    () => today.clone().subtract(todaysIndex, "days"),
    [today, numberOfDays]
  );
  const days = useMemo(
    () =>
      Array.from({ length: numberOfDays }).map((_, index) => ({
        index,
        isPast: index === 0 || index < todaysIndex,
        isToday: index === todaysIndex,
        date: earliestDate.clone().add(index, "days"),
        todos: todos(earliestDate.clone().add(index, "days").date()),
      })),
    [earliestDate, numberOfDays]
  );
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
            <DayText isToday={day.isToday}>{day.date.date()}</DayText>
          </Day>
        ))}
      </DaysContainer>
      <Carousel
        data={days}
        firstItem={todaysIndex}
        sliderWidth={windowWidth}
        itemWidth={windowWidth}
        nestedScrollEnabled
        inactiveSlideScale={1}
        inactiveSlideOpacity={1}
        onBeforeSnapToItem={handleCarouselIndexChange}
        renderItem={(slide) => (
          <TodosList>
            {slide.item.todos.map((todo) => (
              <TodoItem key={todo.id}>
                <Circle />
                <TodoText>{todo.thing}</TodoText>
              </TodoItem>
            ))}
          </TodosList>
        )}
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

const TodoItem = styled.View`
  margin-bottom: ${symbols.spacing._16};
  flex-direction: row;
  align-items: center;
`;

const Circle = styled.View`
  width: 40;
  height: 40;
  background-color: ${symbols.colors.nearWhite};
  border-radius: 20;
  margin-right: ${symbols.spacing._16};
`;

const TodoText = styled(BodyText)``;
