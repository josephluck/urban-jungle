import React from "react";
import { StyleProp, TextInputProps, ViewProps } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { TertiaryText } from "./typography";

export type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  style?: StyleProp<ViewProps>;
  touched?: boolean;
};

export const TextField = ({
  label,
  style,
  error,
  touched,
  ...textFieldProps
}: TextFieldProps) => (
  <Container style={style}>
    {label ? <Label>{label}</Label> : null}
    <Input {...(textFieldProps as any)} />
    {touched && error ? <Error>{error}</Error> : null}
  </Container>
);

const Container = styled.View`
  margin-bottom: ${symbols.spacing._20};
`;

const Label = styled(TertiaryText)`
  margin-bottom: ${symbols.spacing._6};
`;

const Input = styled.TextInput`
  font-size: ${symbols.font._16.size};
  line-height: ${symbols.font._16.lineHeight};
  border-radius: ${symbols.borderRadius.small};
  padding-horizontal: ${symbols.spacing._8};
  padding-vertical: ${symbols.spacing._8};
  background-color: ${symbols.colors.nearWhite};
  border-width: 0;
`;

const Error = styled(TertiaryText)`
  margin-top: ${symbols.spacing._6};
  color: ${symbols.colors.darkRed};
`;
