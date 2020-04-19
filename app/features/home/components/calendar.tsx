import React, { useMemo, useRef, useCallback, useState } from "react";
import moment from "moment";
import styled from "styled-components/native";
import Carousel, { CarouselStatic } from "react-native-snap-carousel";
import { BodyText, SubHeading } from "../../../components/typography";
import { symbols } from "../../../theme";
import { Dimensions, ScrollView, Image } from "react-native";

const todos = (prefix: number) => [
  {
    id: `${prefix}-1`,
    name: "Snake plant",
    thing: `Needs a small drink`,
    image:
      "https://cdn.shopify.com/s/files/1/1802/1289/products/20190207_155147_530x@2x.jpg?v=1552314055",
  },
  {
    id: `${prefix}-2`,
    name: "Dragon tree",
    thing: `A splash of water if topsoil is dry`,
    image:
      "data:image/jpeg;base64,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",
  },
  {
    id: `${prefix}-3`,
    name: "Flamingo flower",
    thing: `Needs a couple sprays of mist`,
    image:
      "https://images.squarespace-cdn.com/content/v1/599ca6a3e4fcb572c84c0670/1517192684421-01DAGU3RJ1OKJP6TYOB1/ke17ZwdGBToddI8pDm48kGgsG4DY8pd3I-6qccqe49R7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0lCYWGxfdB_uf1_ERfebHZ7pXhhk8fOF4XLswu04J9NRK-bC4ElcmNWvd5QeT71hrQ/FullSizeRender.jpg",
  },
  {
    id: `${prefix}-4`,
    name: "Calathea",
    thing: `Check topsoil, a little water if dry`,
    image:
      "https://cdn.shopify.com/s/files/1/1802/1289/files/calathea_10_large.jpg?v=1523596915",
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
            <DayText weight="semibold" isToday={day.isToday}>
              {day.date.date()}
            </DayText>
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
                <Circle>
                  <Image
                    width={circleSize}
                    style={{ aspectRatio: 1, borderRadius: circleSize }}
                    source={{ uri: todo.image }}
                  />
                </Circle>
                <TodoDetail>
                  <TodoTitle>{todo.name}</TodoTitle>
                  <BodyText>{todo.thing}</BodyText>
                </TodoDetail>
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
  margin-bottom: ${symbols.spacing._20};
  flex-direction: row;
  align-items: center;
`;

const circleSize = 66;

const Circle = styled.View`
  width: ${circleSize};
  height: ${circleSize};
  background-color: ${symbols.colors.nearWhite};
  border-radius: ${circleSize / 2};
  margin-right: ${symbols.spacing._12};
`;

const TodoDetail = styled.View`
  flex: 1;
`;

const TodoTitle = styled(SubHeading)`
  margin-bottom: ${symbols.spacing._2};
`;
