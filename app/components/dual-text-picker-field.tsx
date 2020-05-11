import React from "react";
import { StyleProp, ViewProps, Picker } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { TertiaryText } from "./typography";
import { Icon } from "./icon";

export type DualTextPickerFieldProps<Pv extends any> = {
  label?: string;
  error?: string;
  style?: StyleProp<ViewProps>;
  touched?: boolean;
  onTextChange?: (value: string) => void;
  onPickerChange?: (value: Pv) => void;
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
  onTextChange,
  onPickerChange,
  textValue,
  pickerValue,
  options,
  onBlur,
}: DualTextPickerFieldProps<Pv>) => (
  <Container style={style}>
    {label ? <Label>{label}</Label> : null}
    <InputsContainer>
      <Input onChangeText={onTextChange} onBlur={onBlur} value={textValue} />
      <StyledPicker onValueChange={onPickerChange} selectedValue={pickerValue}>
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
    {touched && error ? <ErrorText>{error}</ErrorText> : null}
  </Container>
);

const Container = styled.View`
  margin-bottom: ${symbols.spacing._20};
`;

const Label = styled(TertiaryText)`
  margin-bottom: ${symbols.spacing._6};
`;

const InputsContainer = styled.View`
  background-color: ${symbols.colors.nearWhite};
  flex-direction: row;
  border-radius: ${symbols.borderRadius.small};
  overflow: hidden;
`;

const Input = styled.TextInput`
  border-top-left-radius: ${symbols.borderRadius.small};
  border-bottom-left-radius: ${symbols.borderRadius.small};
  font-size: ${symbols.font._16.size};
  line-height: ${symbols.font._16.lineHeight};
  padding-horizontal: ${symbols.spacing._8};
  padding-vertical: ${symbols.spacing._8};
  border-width: 0;
  border-right-width: 1;
  border-color: ${symbols.colors.appBackground};
  flex: 2;
`;

const StyledPicker = styled.Picker`
  border-top-right-radius: ${symbols.borderRadius.small};
  border-bottom-right-radius: ${symbols.borderRadius.small};
  font-size: ${symbols.font._16.size};
  line-height: ${symbols.font._16.lineHeight};
  padding-horizontal: ${symbols.spacing._12};
  padding-vertical: ${symbols.spacing._8};
  background-color: ${symbols.colors.nearWhite};
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

const ErrorText = styled(TertiaryText)`
  margin-top: ${symbols.spacing._6};
  color: ${symbols.colors.darkRed};
`;
