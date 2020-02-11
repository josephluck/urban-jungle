import React from "react";
import styled from "styled-components/native";
import { StyleProp, ViewStyle } from "react-native";
import { BodyText } from "./typography";
import { SOURCE_SANS_SEMIBOLD } from "../hooks/fonts";

export const ButtonLink = ({
  children,
  style,
  onPress
}: {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  onPress: () => void;
}) => (
  <Wrapper style={style} onPress={onPress}>
    <Link style={style}>{children}</Link>
  </Wrapper>
);

const Wrapper = styled.TouchableOpacity``;

const Link = styled(BodyText)`
  text-transform: uppercase;
  font-family: ${SOURCE_SANS_SEMIBOLD};
  color: ${props => props.theme.colors.lightOffGray};
  font-size: ${props => props.theme.font._14.size}px;
  letter-spacing: 0.5px;
`;
