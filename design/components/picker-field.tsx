import React from "react";
import { StyleProp, ViewProps } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { FormField } from "./form-field";
import { Label } from "./label";
import { TouchableOpacity } from "./touchable-opacity";

export type PickerValue = string | number | undefined;

export type PickerOption<Pv extends PickerValue> = {
  value: Pv;
  label: string;
};

type BasePickerProps<Pv extends PickerValue> = {
  options: PickerOption<Pv>[];
  label?: string;
  error?: string;
  style?: StyleProp<ViewProps>;
  touched?: boolean;
  centered?: boolean;
  newValueLabel?: string;
  onNewValuePress?: () => void;
};

export type SinglePickerFieldProps<Pv extends PickerValue> =
  BasePickerProps<Pv> & {
    value: Pv;
    onChange: (value: Pv) => void;
    multiValue: false;
  };

export type MultiPickerFieldProps<Pv extends PickerValue> =
  BasePickerProps<Pv> & {
    value: Pv[];
    onChange: (value: Pv[]) => void;
    multiValue: true;
  };

export type PickerFieldProps<Pv extends PickerValue> =
  | SinglePickerFieldProps<Pv>
  | MultiPickerFieldProps<Pv>;

function isMultiValue<Pv extends PickerValue>(
  props: any
): props is MultiPickerFieldProps<Pv> {
  return props.multiValue;
}

export function PickerField<Pv extends PickerValue>(
  props: SinglePickerFieldProps<Pv>
): React.ReactElement;

export function PickerField<Pv extends PickerValue>(
  props: MultiPickerFieldProps<Pv>
): React.ReactElement;

export function PickerField<Pv extends PickerValue>(
  props: PickerFieldProps<Pv>
) {
  const handleChange = (value: Pv) => {
    if (isMultiValue<Pv>(props)) {
      props.value.includes(value)
        ? props.onChange(props.value.filter((v) => v !== value))
        : props.onChange([...props.value, value]);
    } else {
      props.onChange(value);
    }
  };

  return (
    <FormField
      label={props.label}
      error={props.error}
      touched={props.touched}
      style={props.style}
    >
      <OptionsContainer centered={props.centered}>
        {props.options.map((option) => (
          <Option
            key={option.value}
            onPress={() => handleChange(option.value)}
            activeOpacity={0.8}
          >
            <OptionLabel
              selected={
                isMultiValue<Pv>(props)
                  ? props.value.includes(option.value)
                  : props.value === option.value
              }
              large
            >
              {option.label}
            </OptionLabel>
          </Option>
        ))}
        {props.newValueLabel && props.onNewValuePress ? (
          <Option
            key="new-value"
            onPress={props.onNewValuePress}
            activeOpacity={0.8}
          >
            <OptionLabel large selected={false}>
              {props.newValueLabel}
            </OptionLabel>
          </Option>
        ) : null}
      </OptionsContainer>
    </FormField>
  );
}

const OptionsContainer = styled.View<{ centered?: boolean }>`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: ${(props) => (props.centered ? "center" : "flex-start")};
`;

const Option = styled(TouchableOpacity)`
  margin-bottom: ${symbols.spacing._4}px;
  margin-right: ${symbols.spacing._4}px;
`;

const OptionLabel = styled(Label)<{
  selected: boolean;
  selectionColor?: string;
}>`
  background-color: ${(props) =>
    props.selected
      ? props.theme.optionBackgroundSelected
      : props.theme.optionBackground};
  border-width: 2px;
  border-color: ${(props) =>
    props.selected
      ? props.theme.optionBorderSelected
      : props.theme.optionBorder};
  }
`;
