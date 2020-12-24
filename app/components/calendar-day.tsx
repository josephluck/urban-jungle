import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import styled from "styled-components/native";

import { symbols } from "../theme";
import { BodyText } from "./typography";

export const CalendarDay = React.memo(
  ({
    isToday,
    date,
    onPress,
    style,
  }: {
    isToday: boolean;
    date: number;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
  }) => {
    return (
      <Day
        onPress={onPress}
        isToday={isToday}
        activeOpacity={0.8}
        style={style}
      >
        <DayText weight="semibold" isToday={isToday}>
          {date}
        </DayText>
      </Day>
    );
  },
);

export const daySize = 50;

const Day = styled.TouchableOpacity<{ isToday: boolean }>`
  width: ${daySize}px;
  height: ${daySize}px;
  background-color: ${(props) =>
    props.isToday ? "transparent" : props.theme.calendarDayBackground};
  border-color: ${(props) => props.theme.calendarDayActive};
  border-width: ${(props) => (props.isToday ? 2 : 0)}px;
  justify-content: center;
  align-items: center;
  border-radius: ${symbols.borderRadius.small}px;
`;

const DayText = styled(BodyText)<{ isToday: boolean }>`
  color: ${(props) =>
    props.isToday
      ? props.theme.calendarDayActive
      : props.theme.calendarDayText};
`;
