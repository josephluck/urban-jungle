import React from "react";
import { Picker, StyleProp, ViewProps } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { FormField } from "./form-field";
import { Icon } from "./icon";

export type DualTextPickerFieldProps<Pv extends any> = {
  label?: string;
  error?: string;
  style?: StyleProp<ViewProps>;
  touched?: boolean;
  onChangeText?: (value: string) => void;
  onChangePicker?: (value: Pv) => void;
  textValue: string;
  pickerValue: Pv;
  options: PickerOption<Pv>[];
  onBlur?: () => void;
};

type PickerOption<Pv> = {
  label: string;
  value: Pv;
};

export const DualTextPickerField = <Pv extends any>({
  label,
  style,
  error,
  touched,
  onChangeText,
  onChangePicker,
  textValue,
  pickerValue,
  options,
  onBlur,
}: DualTextPickerFieldProps<Pv>) => (
  <FormField style={style} label={label} touched={touched} error={error}>
    <InputsContainer>
      <Input onChangeText={onChangeText} onBlur={onBlur} value={textValue} />
      <StyledPicker onValueChange={onChangePicker} selectedValue={pickerValue}>
        {options.map((option) => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </StyledPicker>
      <PickerIconWrapper pointerEvents="none">
        <Icon size={16} icon="chevron-down" />
      </PickerIconWrapper>
    </InputsContainer>
  </FormField>
);

const InputsContainer = styled.View`
  background-color: ${symbols.colors.nearWhite};
  flex-direction: row;
  border-radius: ${symbols.borderRadius.small}px;
  overflow: hidden;
`;

const Input = styled.TextInput`
  border-top-left-radius: ${symbols.borderRadius.small}px;
  border-bottom-left-radius: ${symbols.borderRadius.small}px;
  font-size: ${symbols.font._16.size}px;
  line-height: ${symbols.font._16.lineHeight}px;
  padding-horizontal: ${symbols.spacing._8}px;
  padding-vertical: ${symbols.spacing._8}px;
  border-width: 0px;
  border-right-width: 1;
  border-color: ${symbols.colors.appBackground};
  flex: 2;
`;

const StyledPicker = styled.Picker`
  border-top-right-radius: ${symbols.borderRadius.small}px;
  border-bottom-right-radius: ${symbols.borderRadius.small}px;
  font-size: ${symbols.font._16.size}px;
  line-height: ${symbols.font._16.lineHeight}px;
  padding-horizontal: ${symbols.spacing._12}px;
  padding-vertical: ${symbols.spacing._8}px;
  background-color: ${symbols.colors.nearWhite};
  border-width: 0px;
  flex: 1;
  height: 100%;
`;

const PickerIconWrapper = styled.View`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: ${16 + symbols.spacing._8}px;
  justify-content: center;
  align-items: center;
  padding-right: ${symbols.spacing._8}px;
`;
