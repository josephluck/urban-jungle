import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import styled from "styled-components/native";

import { symbols } from "../theme";
import { TertiaryText } from "./typography";

export const FormField = ({
  touched,
  children,
  error,
  label,
  style,
}: {
  touched?: boolean;
  children?: React.ReactNode;
  error?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) => (
  <Container style={style}>
    {label ? <LabelText>{label}</LabelText> : null}
    {children}
    {touched && error ? <ErrorText>{error}</ErrorText> : null}
  </Container>
);

const Container = styled.View`
  margin-bottom: ${symbols.spacing._20};
`;

const LabelText = styled(TertiaryText)`
  margin-bottom: ${symbols.spacing._6};
`;

const ErrorText = styled(TertiaryText)`
  margin-top: ${symbols.spacing._6};
  color: ${symbols.colors.darkRed};
`;
