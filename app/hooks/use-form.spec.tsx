import React from "react";
import { useForm, constraints } from "./use-form";
import { Text, TextInput } from "react-native";
import { render, fireEvent, wait } from "@testing-library/react-native";
import { View } from "react-native";

describe("useForm", () => {
  const Form = ({
    showErrorsOnlyWhenTouched = true,
  }: {
    showErrorsOnlyWhenTouched?: boolean;
  }) => {
    type Fields = {
      email: string;
      password: string;
      confirmPassword: string;
    };
    const { registerTextInput, values, errors, touched } = useForm<Fields>(
      {
        email: "",
        password: "",
        confirmPassword: "",
      },
      {
        email: [
          constraints.isRequired,
          constraints.isString,
          constraints.isLengthAtLeast(5),
        ],
        password: [
          constraints.isRequired,
          constraints.isString,
          constraints.isLengthAtLeast(8),
        ],
        confirmPassword: [
          constraints.isRequired,
          constraints.isString,
          (value, _key, fields) =>
            constraints.isEqualTo(fields.password)(value),
        ],
      }
    );

    const keys = Object.keys(values) as Array<keyof Fields>;

    return (
      <>
        {keys.map((key) => (
          <View key={key}>
            <TextInput
              key={`${key}-input`}
              testID={`${key}-input`}
              {...registerTextInput(key)}
            />

            <Text key={`${key}-value`} testID={`${key}-value`}>
              {values[key]}
            </Text>

            {!showErrorsOnlyWhenTouched || touched[key] ? (
              <Text key={`${key}-error`} testID={`${key}-error`}>
                {errors[key]}
              </Text>
            ) : null}
          </View>
        ))}
      </>
    );
  };

  it("tracks state", () => {
    const { getByTestId, queryByText } = render(<Form />);
    const emailInput = getByTestId("email-input");
    expect(emailInput).toBeDefined();
    fireEvent.changeText(emailInput, "joe@luck.com");
    const emailValue = queryByText("joe@luck.com");
    expect(emailValue).not.toBeNull();
  });

  it("shows errors for all initially invalid values", () => {
    const { queryAllByText } = render(
      <Form showErrorsOnlyWhenTouched={false} />
    );
    expect(queryAllByText("Required")).toHaveLength(3);
  });

  it("doesn't show any errors for initially invalid values if they arent touched", () => {
    const { queryAllByText } = render(<Form />);
    expect(queryAllByText("Required")).toHaveLength(0);
  });

  it("tracks errors for only touched fields", () => {
    const { getByTestId, queryByText } = render(
      <Form showErrorsOnlyWhenTouched />
    );
    const emailInput = getByTestId("email-input");
    expect(emailInput).toBeDefined();
    fireEvent.changeText(emailInput, "joe@");
    fireEvent.blur(emailInput);
    const emailValue = queryByText("joe@");
    const emailError = queryByText("Must be at least 5 characters long");
    expect(emailValue).not.toBeNull();
    expect(emailError).not.toBeNull();
  });

  it("tracks all errors", () => {
    const { getByTestId, queryByText } = render(
      <Form showErrorsOnlyWhenTouched={false} />
    );
    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");
    const confirmPasswordInput = getByTestId("confirmPassword-input");
    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();
    expect(confirmPasswordInput).toBeDefined();
    fireEvent.changeText(emailInput, "joe@");
    fireEvent.changeText(passwordInput, "passwo");
    fireEvent.changeText(confirmPasswordInput, "passwl");
    const emailError = queryByText("Must be at least 5 characters long");
    const passwordError = queryByText("Must be at least 8 characters long");
    const confirmPasswordError = queryByText("Expected passwl to equal passwo");
    expect(emailError).not.toBeNull();
    expect(passwordError).not.toBeNull();
    expect(confirmPasswordError).not.toBeNull();
  });
});
