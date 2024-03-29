import React from "react";
import { StyleProp, TextInputProps, ViewProps } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { FormField } from "./form-field";

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
  <FormField style={style} label={label} touched={touched} error={error}>
    <Input {...(textFieldProps as any)} />
  </FormField>
);

const Input = styled.TextInput`
  font-size: ${symbols.font._16.size}px;
  line-height: ${symbols.font._16.lineHeight}px;
  border-radius: ${symbols.borderRadius.small}px;
  padding-horizontal: ${symbols.spacing._8}px;
  padding-vertical: ${symbols.spacing._8}px;
  background-color: ${(props) => props.theme.fieldBackground};
  color: ${(props) => props.theme.defaultTextColor};
  border-width: 0px;
`;
