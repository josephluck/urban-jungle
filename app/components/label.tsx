import React from "react";
import { StyleProp, TextStyle } from "react-native";
import { ViewStyle } from "react-native";
import styled from "styled-components/native";

import { symbols } from "../theme";
import { BodyText } from "./typography";

export const Label = ({
  children,
  style,
  large = false,
}: {
  children: string;
  style?: StyleProp<ViewStyle>;
  large?: boolean;
}) => (
  <LabelContainer style={style} large={large}>
    <LabelText weight={large ? "bold" : "semibold"} large={large}>
      {children}
    </LabelText>
  </LabelContainer>
);

const LabelContainer = styled.View<{ large: boolean }>`
  padding-horizontal: ${(props) =>
    props.large ? symbols.spacing._12 : symbols.spacing._6}px;
  padding-vertical: ${(props) =>
    props.large ? symbols.spacing._6 : symbols.spacing._2}px;
  border-radius: ${(props) =>
    props.large ? symbols.borderRadius.small : symbols.borderRadius.tiny}px;
  background-color: ${(props) => props.theme.labelBackground};
`;

export const LabelText = styled(BodyText)<{ large: boolean }>`
  font-size: ${(props) =>
    props.large ? symbols.font._16.size : symbols.font._12.size}px;
  color: ${(props) => props.theme.labelText};
`;
