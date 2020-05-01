import React from "react";
import styled from "styled-components/native";
import { BodyText } from "./typography";
import { symbols } from "../theme";

export const CalendarDay = React.memo(
  ({
    isPast,
    isToday,
    date,
    onPress,
  }: {
    isPast: boolean;
    isToday: boolean;
    date: number;
    onPress: () => void;
  }) => {
    return (
      <Day
        onPress={onPress}
        isPast={isPast}
        isToday={isToday}
        activeOpacity={0.8}
      >
        <DayText weight="semibold" isToday={isToday}>
          {date}
        </DayText>
      </Day>
    );
  }
);

export const daySize = 50;

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
  border-radius: ${symbols.borderRadius.small};
`;

const DayText = styled(BodyText)<{ isToday: boolean }>`
  color: ${(props) =>
    props.isToday ? symbols.colors.solidBlue : symbols.colors.offBlack};
`;
