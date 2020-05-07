import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { StyleProp, ViewStyle } from "react-native";
import { Icon } from "./icon";

export const TouchableIcon = ({
  icon,
  size = 28,
  onPress,
  style,
  disabled = false,
}: {
  icon: string;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) => (
  <IconButtonContainer
    disabled={disabled}
    style={style}
    onPress={onPress}
    activeOpacity={0.6}
  >
    <Icon icon={icon} size={size} />
  </IconButtonContainer>
);

const IconButtonContainer = styled.TouchableOpacity`
  min-width: ${symbols.size.minimumTouchableSize}px;
  min-height: ${symbols.size.minimumTouchableSize}px;
  align-items: center;
  justify-content: center;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;
