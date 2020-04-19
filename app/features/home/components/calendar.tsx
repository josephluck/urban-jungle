import React, { useMemo } from "react";
import moment from "moment";
import styled from "styled-components/native";
import Carousel from "react-native-snap-carousel";
import { BodyText } from "../../../components/typography";
import { symbols } from "../../../theme";
import { Dimensions } from "react-native";

export const Calendar = (_props: { householdId: string }) => {
  const today = useMemo(() => moment().day(), []);
  const todos = (prefix: number) => [
    {
      id: `${prefix}-1`,
      thing: "Water",
    },
    {
      id: `${prefix}-2`,
      thing: "Water",
    },
    {
      id: `${prefix}-3`,
      thing: "Prune",
    },
    {
      id: `${prefix}-4`,
      thing: "Feed",
    },
    {
      id: `${prefix}-5`,
      thing: "Water",
    },
    {
      id: `${prefix}-6`,
      thing: "Water",
    },
    {
      id: `${prefix}-7`,
      thing: "Prune",
    },
    {
      id: `${prefix}-8`,
      thing: "Feed",
    },
    {
      id: `${prefix}-9`,
      thing: "Water",
    },
    {
      id: `${prefix}-10`,
      thing: "Water",
    },
    {
      id: `${prefix}-11`,
      thing: "Prune",
    },
    {
      id: `${prefix}-12`,
      thing: "Feed",
    },
    {
      id: `${prefix}-13`,
      thing: "Water",
    },
    {
      id: `${prefix}-14`,
      thing: "Water",
    },
    {
      id: `${prefix}-15`,
      thing: "Prune",
    },
    {
      id: `${prefix}-16`,
      thing: "Feed",
    },
  ];
  return (
    <Container>
      <MonthText weight="semibold">April</MonthText>
      <DaysContainer
        horizontal
        snapToInterval={48}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: symbols.spacing.appHorizontal,
          backgroundColor: symbols.colors.appBackground,
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <Day key={i}>
            <DayText>{today + i}</DayText>
          </Day>
        ))}
      </DaysContainer>
      <Carousel
        data={[todos(1), todos(2), todos(3), todos(4)]}
        sliderWidth={Dimensions.get("window").width}
        itemWidth={Dimensions.get("window").width}
        nestedScrollEnabled
        inactiveSlideScale={1}
        inactiveSlideOpacity={1}
        renderItem={(slide) => (
          <TodosList>
            {slide.item.map((todo) => (
              <TodoItem key={todo.id}>
                <Circle />
                <TodoText>{todo.thing}</TodoText>
              </TodoItem>
            ))}
          </TodosList>
        )}
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
  margin-bottom: ${symbols.spacing._22};
`;

const Day = styled.View`
  width: 40;
  height: 40;
  background-color: ${symbols.colors.nearWhite};
  justify-content: center;
  align-items: center;
  margin-right: ${symbols.spacing._8};
  border-radius: ${symbols.borderRadius.tiny};
`;

const DayText = styled(BodyText)``;

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
