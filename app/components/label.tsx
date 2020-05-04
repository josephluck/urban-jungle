import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { BodyText } from "./typography";
import { StyleProp } from "react-native";
import { ViewStyle } from "react-native";

export const Label = ({
  children,
  style,
}: {
  children: string;
  style?: StyleProp<ViewStyle>;
}) => (
  <LabelContainer style={style}>
    <LabelText weight="bold">{children.toUpperCase()}</LabelText>
  </LabelContainer>
);

const LabelContainer = styled.View`
  padding-horizontal: ${symbols.spacing._6}px;
  padding-vertical: ${symbols.spacing._2}px;
  border-radius: ${symbols.borderRadius.tiny}px;
  background-color: ${symbols.colors.nearWhite};
`;

const LabelText = styled(BodyText)`
  font-size: ${symbols.font._12.size}px;
  color: ${symbols.colors.deepGray};
`;
