import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import styled, { useTheme } from "styled-components/native";
import { symbols } from "../theme";
import { Icon } from "./icon";
import { TouchableOpacity } from "./touchable-opacity";

export const TouchableIcon = ({
  icon,
  size = 28,
  onPress,
  style,
  disabled = false,
}: {
  icon: string;
  onPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) => {
  const theme = useTheme();
  return (
    <IconButtonContainer
      disabled={disabled}
      style={style}
      onPress={onPress}
      activeOpacity={0.6}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Icon icon={icon} size={size} color={theme.defaultTextColor} />
    </IconButtonContainer>
  );
};

const IconButtonContainer = styled(TouchableOpacity)`
  min-width: ${symbols.size.minimumTouchableSize}px;
  min-height: ${symbols.size.minimumTouchableSize}px;
  align-items: center;
  justify-content: center;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;
