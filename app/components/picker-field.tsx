import React from "react";
import { StyleProp, ViewProps } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { FormField } from "./form-field";
import { Label } from "./label";

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
};

export type SinglePickerFieldProps<Pv extends PickerValue> = BasePickerProps<
  Pv
> & {
  value: Pv;
  onChange: (value: Pv) => void;
  multiValue: false;
};

export type MultiPickerFieldProps<Pv extends PickerValue> = BasePickerProps<
  Pv
> & {
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
    <FormField label={props.label} error={props.error} touched={props.touched}>
      <OptionsContainer>
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
      </OptionsContainer>
    </FormField>
  );
}

const OptionsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const Option = styled.TouchableOpacity`
  margin-bottom: ${symbols.spacing._4};
  margin-right: ${symbols.spacing._4};
`;

const OptionLabel = styled(Label)<{ selected: boolean }>`
  background-color: ${(props) =>
    props.selected ? symbols.colors.pureWhite : symbols.colors.nearWhite};
  border-width: 2;
  border-color: ${(props) =>
    props.selected ? symbols.colors.darkGreen : symbols.colors.nearWhite};
`;
