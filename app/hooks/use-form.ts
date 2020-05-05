import { makeValidator, FieldConstraintsMap } from "@josephluck/valley/lib/fp";
import { useState } from "react";
import { TextInputProps } from "react-native";
import { pipe } from "fp-ts/lib/pipeable";
import * as E from "fp-ts/lib/Either";

type Fields = Record<string, any>;

export function useForm<Fs extends Fields>(
  initialValues: Fs,
  constraints: FieldConstraintsMap<Fs>
) {
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
  ): ReturnType<typeof doValidate> => {
    console.log("Running validation", { currentValues });
    return pipe(
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

  const registerTextInput = <Fk extends keyof Fs>(
    fieldKey: Fk
  ): Partial<TextInputProps> => ({
    value: values[fieldKey],
    onBlur: registerBlur(fieldKey),
    onChangeText: registerOnChangeText(fieldKey),
  });

  return {
    values,
    touched,
    errors,
    validate,
    setValue,
    setValues: setValuesAndValidate,
    registerTextInput,
    reset,
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
