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
}: {
  icon?: IconProp;
  style?: StyleProp<ViewStyle>;
  children?: string;
  onPress: () => void;
}) => (
  <IconButtonContainer onPress={onPress} activeOpacity={0.6} style={style}>
    {/* <FontAwesomeIcon icon={icon} /> */}
    {children && <IconButtonText weight="semibold">{children}</IconButtonText>}
  </IconButtonContainer>
);

const IconButtonContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding-vertical: ${symbols.spacing._4};
  padding-horizontal: ${symbols.spacing._6};
  border-width: 2;
  border-color: ${symbols.colors.nearBlack};
  align-items: center;
  border-radius: 9999;
`;

const IconButtonText = styled(BodyText)`
  margin-left: ${symbols.spacing._4};
  margin-right: ${symbols.spacing._4};
`;
