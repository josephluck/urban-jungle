import React, { useMemo } from "react";
import moment from "moment";
import styled from "styled-components/native";
import { BodyText } from "../../../components/typography";
import { symbols } from "../../../theme";

export const Calendar = (_props: { householdId: string }) => {
  const today = useMemo(() => moment().day(), []);
  const todos = [
    {
      id: 1,
      thing: "Water",
    },
    {
      id: 2,
      thing: "Water",
    },
    {
      id: 3,
      thing: "Prune",
    },
    {
      id: 4,
      thing: "Feed",
    },
    {
      id: 1,
      thing: "Water",
    },
    {
      id: 2,
      thing: "Water",
    },
    {
      id: 3,
      thing: "Prune",
    },
    {
      id: 4,
      thing: "Feed",
    },
    {
      id: 1,
      thing: "Water",
    },
    {
      id: 2,
      thing: "Water",
    },
    {
      id: 3,
      thing: "Prune",
    },
    {
      id: 4,
      thing: "Feed",
    },
    {
      id: 1,
      thing: "Water",
    },
    {
      id: 2,
      thing: "Water",
    },
    {
      id: 3,
      thing: "Prune",
    },
    {
      id: 4,
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
      <TodosContainer>
        {todos.map((todo) => (
          <TodoItem key={todo.id}>
            <Circle />
            <TodoText>{todo.thing}</TodoText>
          </TodoItem>
        ))}
      </TodosContainer>
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

const TodosContainer = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal};
  background-color: ${symbols.colors.appBackground};
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
