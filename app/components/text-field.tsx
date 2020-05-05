import React from "react";
import { StyleProp, TextInputProps, ViewProps } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { BodyText } from "./typography";

export type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  style?: StyleProp<ViewProps>;
};

export const TextField = ({
  label,
  style,
  error,
  ...textFieldProps
}: TextFieldProps) => {
  return (
    <Container style={style}>
      {label ? <Label>{label}</Label> : null}
      <Input {...(textFieldProps as any)} />
      {error ? <Error>{error}</Error> : null}
    </Container>
  );
};

const Container = styled.View``;

const Label = styled(BodyText)`
  margin-bottom: ${symbols.spacing._6};
`;

const Input = styled.TextInput`
  border-radius: ${symbols.borderRadius.small};
  padding-horizontal: ${symbols.spacing._6};
  padding-vertical: ${symbols.spacing._8};
  background-color: ${symbols.colors.nearWhite};
  border-width: 0;
`;

const Error = styled(BodyText)`
  margin-top: ${symbols.spacing._6};
  color: ${symbols.colors.darkRed};
`;
