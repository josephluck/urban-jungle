import React from "react";
import styled from "styled-components/native";
// import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { symbols } from "../theme";
import { BodyText } from "./typography";
import { StyleProp, ViewStyle } from "react-native";

export const IconButton = ({
  children,
  onPress,
  style,
  disabled,
  large = false,
}: {
  icon?: IconProp;
  style?: StyleProp<ViewStyle>;
  children?: string;
  onPress: () => void;
  disabled?: boolean;
  large?: boolean;
}) => (
  <IconButtonContainer
    onPress={onPress}
    activeOpacity={0.6}
    style={style}
    disabled={disabled}
    large={large}
  >
    {children && <IconButtonText weight="semibold">{children}</IconButtonText>}
  </IconButtonContainer>
);

const IconButtonContainer = styled.TouchableOpacity<{ large: boolean }>`
  flex-direction: row;
  padding-vertical: ${(props) =>
    props.large ? symbols.spacing._8 : symbols.spacing._4};
  padding-horizontal: ${symbols.spacing._6};
  align-items: center;
  justify-content: center;
  border-radius: 9999;
  background-color: ${symbols.colors.nearBlack};
`;

const IconButtonText = styled(BodyText)`
  margin-left: ${symbols.spacing._4};
  margin-right: ${symbols.spacing._4};
  color: ${symbols.colors.pureWhite};
`;
