import React from "react";
import styled from "styled-components/native";
import { StyleProp, ViewStyle } from "react-native";
import { OverlineText } from "./typography";

export const TextButton = ({
  children,
  style,
  onPress
}: {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  onPress: () => void;
}) => (
  <Wrapper style={style} onPress={onPress}>
    <OverlineText style={style}>{children}</OverlineText>
  </Wrapper>
);

const Wrapper = styled.TouchableOpacity``;
