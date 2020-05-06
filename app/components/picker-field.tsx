import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { TertiaryText } from "./typography";
import { Label } from "./label";
import { StyleProp, ViewProps } from "react-native";

type BasePickerProps = {
  options: string[];
  label?: string;
  error?: string;
  style?: StyleProp<ViewProps>;
  touched?: boolean;
};

export type SinglePickerFieldProps = BasePickerProps & {
  value: string;
  onChange: (value: string) => void;
  multiValue: false;
};

export type MultiPickerFieldProps = BasePickerProps & {
  value: string[];
  onChange: (value: string[]) => void;
  multiValue: true;
};

export type PickerFieldProps = SinglePickerFieldProps | MultiPickerFieldProps;

function isMultiValue(props: any): props is MultiPickerFieldProps {
  return props.isMultiValue;
}

export function PickerField<Value extends string>(
  props: SinglePickerFieldProps
): React.ReactElement;

export function PickerField<Value extends string[]>(
  props: MultiPickerFieldProps
): React.ReactElement;

export function PickerField(props: PickerFieldProps) {
  const handleChange = (option: any) => {
    if (isMultiValue(props)) {
      props.value.includes(option)
        ? props.onChange(props.value.filter((value) => value !== option))
        : props.onChange([...props.value, option]);
    } else {
      props.onChange(option === props.value ? "" : option);
    }
  };

  return (
    <Container style={props.style}>
      {props.label ? <FieldLabel>{props.label}</FieldLabel> : null}
      <OptionsContainer>
        {props.options.map((option) => (
          <Option
            key={option}
            onPress={() => handleChange(option)}
            activeOpacity={0.8}
          >
            <OptionLabel
              selected={
                isMultiValue(props)
                  ? props.value.includes(option)
                  : props.value === option
              }
              large
            >
              {option}
            </OptionLabel>
          </Option>
        ))}
      </OptionsContainer>
      {props.touched && props.error ? <Error>{props.error}</Error> : null}
    </Container>
  );
}

const Container = styled.View`
  margin-bottom: ${symbols.spacing._20};
`;

const FieldLabel = styled(TertiaryText)`
  margin-bottom: ${symbols.spacing._6};
`;

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

const Error = styled(TertiaryText)`
  margin-top: ${symbols.spacing._6};
  color: ${symbols.colors.darkRed};
`;
