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
  }
);

export const daySize = 50;

const Day = styled.TouchableOpacity<{ isToday: boolean }>`
  width: ${daySize};
  height: ${daySize};
  background-color: ${(props) =>
    props.isToday ? "transparent" : symbols.colors.nearWhite};
  border-color: ${symbols.colors.solidBlue};
  border-width: ${(props) => (props.isToday ? 2 : 0)};
  opacity: ${(props) => (props.isToday ? 1 : 0.5)};
  justify-content: center;
  align-items: center;
  border-radius: ${symbols.borderRadius.small};
`;

const DayText = styled(BodyText)<{ isToday: boolean }>`
  color: ${(props) =>
    props.isToday ? symbols.colors.solidBlue : symbols.colors.offBlack};
`;
