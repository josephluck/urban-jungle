import React from "react";
import { StyleProp, TextInputProps, ViewProps } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { FormField } from "./form-field";

export type NumberFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  style?: StyleProp<ViewProps>;
  touched?: boolean;
  onChangeNumber?: (value: number) => void;
  value?: number;
};

export const NumberField = ({
  label,
  style,
  error,
  touched,
  value,
  onChangeNumber,
  ...numberFieldProps
}: NumberFieldProps) => (
  <FormField style={style} label={label} touched={touched} error={error}>
    <Input
      {...(numberFieldProps as any)}
      value={(value || "").toString()}
      onChangeText={(val) => {
        if (onChangeNumber) {
          const asNumber = parseInt(val);
          const isValidNumber =
            Number.isInteger(asNumber) && !Number.isNaN(asNumber);
          onChangeNumber(isValidNumber ? asNumber : 0);
        }
      }}
    />
  </FormField>
);

const Input = styled.TextInput`
  font-size: ${symbols.font._16.size}px;
  line-height: ${symbols.font._16.lineHeight}px;
  border-radius: ${symbols.borderRadius.small}px;
  padding-horizontal: ${symbols.spacing._8}px;
  padding-vertical: ${symbols.spacing._8}px;
  background-color: ${symbols.colors.nearWhite};
  border-width: 0px;
`;
