import * as O from "fp-ts/lib/Option";
import { makeValidator, FieldConstraintsMap } from "@josephluck/valley/lib/fp";
import { useState } from "react";
import { pipe } from "fp-ts/lib/pipeable";
import * as E from "fp-ts/lib/Either";
import {
  SinglePickerFieldProps,
  MultiPickerFieldProps,
  PickerValue,
} from "../components/picker-field";
import { TextFieldProps } from "../components/text-field";
import { CameraFieldProps } from "../components/camera-field";
import { ImageModel, makeImageModel } from "../models/image";
import { DualTextPickerFieldProps } from "../components/dual-text-picker-field";

type Fields = Record<string, any>;

type FilterType<O, T> = { [K in keyof O]: O[K] extends T ? K : never };

type FilterTypeForKeys<O, T> = FilterType<O, T>[keyof O];

export function useForm<Fs extends Fields>(
  initialValues: Fs,
  constraints: FieldConstraintsMap<Fs>
) {
  type StringKeys = FilterTypeForKeys<Fs, string>;

  type NumberKeys = FilterTypeForKeys<Fs, number>;

  type MultiPickerKeys = FilterTypeForKeys<Fs, number[] | string[]>;

  // TODO: support optional single picker via a different registration that picks types that match | undefined
  // support optional single picker as first-class of picker component, atm you can't unselect a value
  // and make this one a required single picker
  type SinglePickerKeys = FilterTypeForKeys<Fs, string | number | undefined>;

  type CameraKeys = FilterTypeForKeys<Fs, ImageModel>;

  const doValidate = makeValidator<Fs>(constraints);

  const [values, setValues] = useState(initialValues);

  const [touched, setTouched] = useState(() =>
    getInitialTouched(initialValues)
  );

  const [errors, setErrors] = useState<Record<keyof Fs, string>>(() =>
    pipe(
      doValidate(initialValues),
      E.swap,
      E.getOrElse(() => getInitialErrors(initialValues))
    )
  );

  const validate = (
    currentValues: Fs = values
  ): ReturnType<typeof doValidate> =>
    pipe(
      doValidate(currentValues),
      E.mapLeft((e) => {
        setErrors(e);
        return e;
      }),
      E.map((v) => {
        setErrors(getInitialErrors(initialValues));
        return v;
      })
    );

  const setAllTouched = () => {
    setTouched(
      Object.keys(initialValues).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        initialValues
      )
    );
  };

  const setValue = <Fk extends keyof Fs>(fieldKey: Fk, fieldValue: Fs[Fk]) => {
    const newValues: Fs = { ...values, [fieldKey]: fieldValue };
    setValues(newValues);
    validate(newValues);
  };

  const setValuesAndValidate = (vals: Partial<Fs>) => {
    const newValues: Fs = { ...values, ...vals };
    setValues(newValues);
    validate(newValues);
  };

  const submit = () => {
    setAllTouched();
    return validate();
  };

  const reset = () => {
    setValues(initialValues);
    setTouched(getInitialTouched(initialValues));
    setErrors(getInitialErrors(initialValues));
  };

  const registerBlur = <Fk extends keyof Fs>(fieldKey: Fk) => () => {
    setTouched((current) => ({ ...current, [fieldKey]: true }));
  };

  const registerOnChangeText = <Fk extends keyof Fs>(fieldKey: Fk) => (
    value: string
  ) => {
    // @ts-ignore - TODO narrow Fk such that it only includes Fk whereby Fs[Fk] === string
    setValue(fieldKey, value);
  };

  const registerOnChangePickerMulti = <Fk extends MultiPickerKeys>(
    fieldKey: Fk
  ) => (value: PickerValue[]) => {
    setValue(fieldKey, value as Fs[Fk]);
  };

  const registerOnChangePickerSingle = <Fk extends SinglePickerKeys>(
    fieldKey: Fk
  ) => (value: Fs[Fk]) => {
    setValue(fieldKey, value);
  };

  const registerOnChangeCamera = <Fk extends CameraKeys>(fieldKey: Fk) => (
    value: Fs[Fk]
  ) => {
    setValue(fieldKey, value);
  };

  const registerTextInput = <Fk extends StringKeys>(
    fieldKey: Fk
  ): Partial<TextFieldProps> => ({
    value: values[fieldKey],
    error: errors[fieldKey],
    touched: touched[fieldKey],
    onBlur: registerBlur(fieldKey),
    onChangeText: registerOnChangeText(fieldKey),
  });

  const registerMultiPickerInput = <Fk extends MultiPickerKeys>(
    fieldKey: Fk
  ): Pick<
    MultiPickerFieldProps<PickerValue>,
    "value" | "error" | "onChange" | "touched"
  > => ({
    value: values[fieldKey],
    error: errors[fieldKey],
    touched: touched[fieldKey],
    onChange: registerOnChangePickerMulti(fieldKey),
  });

  const registerSinglePickerInput = <Fk extends SinglePickerKeys>(
    fieldKey: Fk
  ): Pick<
    SinglePickerFieldProps<Fs[Fk]>,
    "value" | "error" | "onChange" | "touched"
  > => ({
    value: values[fieldKey],
    error: errors[fieldKey],
    touched: touched[fieldKey],
    onChange: registerOnChangePickerSingle(fieldKey),
  });

  const registerCameraField = <Fk extends CameraKeys>(
    fieldKey: Fk
  ): Pick<CameraFieldProps, "value" | "error" | "touched" | "onChange"> => {
    const value: ImageModel = pipe(
      O.fromNullable(values[fieldKey] as ImageModel),
      O.filter((image) => Boolean(image) && Boolean(image.uri)),
      O.getOrElse(() => makeImageModel())
    );
    return {
      value,
      error: errors[fieldKey],
      touched: touched[fieldKey],
      onChange: registerOnChangeCamera(fieldKey) as (value: ImageModel) => void,
    };
  };

  const registerDualPickerField = <
    Fk extends StringKeys,
    Fk2 extends SinglePickerKeys
  >(
    textFieldKey: Fk,
    pickerFieldKey: Fk2
  ): Pick<
    DualTextPickerFieldProps<Fs[Fk2]>,
    | "textValue"
    | "pickerValue"
    | "onTextChange"
    | "onPickerChange"
    | "error"
    | "touched"
    | "onBlur"
  > => ({
    textValue: values[textFieldKey],
    pickerValue: values[pickerFieldKey],
    onTextChange: registerOnChangeText(textFieldKey),
    onPickerChange: registerOnChangePickerSingle(pickerFieldKey),
    error: errors[textFieldKey] || errors[pickerFieldKey],
    touched: touched[textFieldKey] || touched[pickerFieldKey],
    onBlur: () => {
      registerBlur(textFieldKey)();
      registerBlur(pickerFieldKey)();
    },
  });

  return {
    values,
    touched,
    errors,
    validate,
    setValue,
    setValues: setValuesAndValidate,
    reset,
    submit,
    registerTextInput,
    registerMultiPickerInput,
    registerSinglePickerInput,
    registerCameraField,
    registerDualPickerField,
  };
}

const getInitialTouched = <Fs extends Record<string, any>>(
  fields: Fs
): Record<keyof Fs, boolean> =>
  Object.keys(fields).reduce(
    (acc, fieldKey) => ({ ...acc, [fieldKey]: false }),
    fields
  );

const getInitialErrors = <Fs extends Record<string, any>>(
  fields: Fs
): Record<keyof Fs, string> =>
  Object.keys(fields).reduce(
    (acc, fieldKey) => ({ ...acc, [fieldKey]: "" }),
    fields
  );

const isRequired = <T>(value: T): E.Either<string, T> =>
  Boolean(value) ? E.right(value) : E.left("Required");

const isOfType = (type: string) => <T>(value: T): E.Either<string, T> =>
  typeof value === type ? E.right(value) : E.left(`Expected a ${type}`);

const isString = isOfType("string");

const isNumber = isOfType("number");

const isEqualTo = <T>(expected: T) => <V extends T>(
  value: V
): E.Either<string, V> =>
  value === expected
    ? E.right(value)
    : E.left(`Expected ${value} to equal ${expected}`);

const isLengthAtLeast = (length: number) => (
  value: string
): E.Either<string, string> =>
  value.length >= length
    ? E.right(value)
    : E.left(`Must be at least ${length} characters long`);

export const constraints = {
  isRequired,
  isOfType,
  isString,
  isNumber,
  isEqualTo,
  isLengthAtLeast,
};
