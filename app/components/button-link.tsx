import React from "react";
import styled from "styled-components/native";
import { StyleProp, ViewStyle } from "react-native";
import { BodyText } from "./typography";

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

const Wrapper = styled.TouchableOpacity`
  border-bottom-color: ${props => props.theme.colors.pureWhite};
  border-bottom-width: 1px;
`;

const Link = styled(BodyText)``;
