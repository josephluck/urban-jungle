import React from "react";
import styled from "styled-components/native";
import { StyleProp, ViewStyle } from "react-native";
import { TertiaryButtonText } from "./typography";

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
    <TertiaryButtonText style={style}>{children}</TertiaryButtonText>
  </Wrapper>
);

const Wrapper = styled.TouchableOpacity``;
