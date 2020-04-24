import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { StyleProp, ViewStyle } from "react-native";

export const TouchableIcon = ({
  icon,
  size = 28,
  onPress,
  style,
}: {
  icon: IconProp;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) => (
  <IconButtonContainer style={style} onPress={onPress} activeOpacity={0.6}>
    <FontAwesomeIcon icon={icon} size={size} />
  </IconButtonContainer>
);

const IconButtonContainer = styled.TouchableOpacity`
  min-width: ${symbols.size.minimumTouchableSize};
  min-height: ${symbols.size.minimumTouchableSize};
  align-items: center;
  justify-content: center;
`;
