import React, { useCallback, useState, useEffect } from "react";
import { Heading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { selectHasAuthenticated } from "../store/state";
import { signIn } from "../store/effects";
import { Button, TextInput, Text } from "react-native";
import { useStore } from "../../../store/state";
import { careRoute } from "../../care/components/care-screen";
import { NavigationStackScreenProps } from "react-navigation-stack";

export const SignIn = ({ navigation }: NavigationStackScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const hasAuthenticated = useStore(selectHasAuthenticated);

  useEffect(() => {
    if (hasAuthenticated) {
      careRoute.navigateTo(navigation, {});
    }
  }, [hasAuthenticated]);

  const handleSignIn = useCallback(async () => {
    await signIn(email, password);
  }, [email, password]);

  return (
    <ScreenLayout>
      <Heading>Sign in</Heading>

      <Text style={{ color: "black" }}>Email</Text>
      <TextInput
        style={{ color: "black" }}
        textContentType="emailAddress"
        autoCapitalize="none"
        onChangeText={setEmail}
      />

      <Text style={{ color: "black" }}>Password</Text>
      <TextInput
        style={{ color: "black" }}
        textContentType="password"
        secureTextEntry
        autoCapitalize="none"
        onChangeText={setPassword}
      />

      <Button title="Sign in" onPress={handleSignIn} />
    </ScreenLayout>
  );
};

export const SIGN_IN_SCREEN = "LOGIN_SCREEN";
export const createLoginRoute = () => SIGN_IN_SCREEN;
