import React, { useCallback, useContext, useState, useEffect } from "react";
import { Heading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { selectHasAuthenticated } from "../store/state";
import { signIn } from "../store/effects";
import { Button, TextInput, Text } from "react-native";
import { NavigationContext } from "react-navigation";
import { useStore } from "../../../store/state";
import { createCareRoute } from "../../care/components/care-screen";

export const SignIn = () => {
  const { navigate } = useContext(NavigationContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const hasAuthenticated = useStore(selectHasAuthenticated);

  useEffect(() => {
    if (hasAuthenticated) {
      navigate(createCareRoute());
    }
  }, [hasAuthenticated]);

  const handleSignIn = useCallback(async () => {
    await signIn(email, password);
  }, [email, password]);

  return (
    <ScreenLayout>
      <Heading>Sign in</Heading>

      <Text style={{ color: "white" }}>Email</Text>
      <TextInput style={{ color: "white" }} onChangeText={setEmail} />

      <Text style={{ color: "white" }}>Password</Text>
      <TextInput style={{ color: "white" }} onChangeText={setPassword} />

      <Button title="Sign in" onPress={handleSignIn} />
    </ScreenLayout>
  );
};

export const SIGN_IN_SCREEN = "LOGIN_SCREEN";
export const createLoginRoute = () => SIGN_IN_SCREEN;
