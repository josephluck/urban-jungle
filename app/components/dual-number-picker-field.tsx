import React from "react";
import { Picker, StyleProp, ViewProps } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { FormField } from "./form-field";
import { Icon } from "./icon";

export type DualNumberPickerFieldProps<Pv extends any> = {
  label?: string;
  error?: string;
  style?: StyleProp<ViewProps>;
  touched?: boolean;
  onChangeNumber?: (value: number) => void;
  onChangePicker?: (value: Pv) => void;
  numberValue: number;
  pickerValue: Pv;
  options: PickerOption<Pv>[];
  onBlur?: () => void;
};

type PickerOption<Pv> = {
  label: string;
  value: Pv;
};

export const DualNumberPickerField = <Pv extends any>({
  label,
  style,
  error,
  touched,
  onChangeNumber,
  onChangePicker,
  numberValue,
  pickerValue,
  options,
  onBlur,
}: DualNumberPickerFieldProps<Pv>) => (
  <FormField style={style} label={label} touched={touched} error={error}>
    <InputsContainer>
      <Input
        onBlur={onBlur}
        value={(numberValue || "").toString()}
        keyboardType="number-pad"
        onChangeText={(val) => {
          if (onChangeNumber) {
            const asNumber = parseInt(val);
            const isValidNumber =
              Number.isInteger(asNumber) && !Number.isNaN(asNumber);
            onChangeNumber(isValidNumber ? asNumber : 0);
          }
        }}
      />
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
  background-color: ${(props) => props.theme.fieldBackground};
  flex-direction: row;
  border-radius: ${symbols.borderRadius.small};
  overflow: hidden;
`;

const Input = styled.TextInput`
  color: ${(props) => props.theme.defaultTextColor};
  border-top-left-radius: ${symbols.borderRadius.small};
  border-bottom-left-radius: ${symbols.borderRadius.small};
  font-size: ${symbols.font._16.size};
  line-height: ${symbols.font._16.lineHeight};
  padding-horizontal: ${symbols.spacing._8};
  padding-vertical: ${symbols.spacing._8};
  border-width: 0;
  border-right-width: 1;
  border-color: ${(props) => props.theme.appBackground};
  flex: 2;
`;

const StyledPicker = styled.Picker`
  color: ${(props) => props.theme.defaultTextColor};
  border-top-right-radius: ${symbols.borderRadius.small};
  border-bottom-right-radius: ${symbols.borderRadius.small};
  font-size: ${symbols.font._16.size};
  line-height: ${symbols.font._16.lineHeight};
  padding-horizontal: ${symbols.spacing._12};
  padding-vertical: ${symbols.spacing._8};
  background-color: ${(props) => props.theme.fieldBackground};
  border-width: 0;
  flex: 1;
  height: 100%;
`;

const PickerIconWrapper = styled.View`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: ${16 + symbols.spacing._8};
  justify-content: center;
  align-items: center;
  padding-right: ${symbols.spacing._8};
`;
