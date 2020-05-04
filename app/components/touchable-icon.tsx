import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { Feather } from "@expo/vector-icons";
import { StyleProp, ViewStyle } from "react-native";

export const TouchableIcon = ({
  icon,
  size = 28,
  onPress,
  style,
}: {
  icon: string;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) => (
  <IconButtonContainer style={style} onPress={onPress} activeOpacity={0.6}>
    <Feather name={icon} size={size} />
  </IconButtonContainer>
);

const IconButtonContainer = styled.TouchableOpacity`
  min-width: ${symbols.size.minimumTouchableSize}px;
  min-height: ${symbols.size.minimumTouchableSize}px;
  align-items: center;
  justify-content: center;
`;
