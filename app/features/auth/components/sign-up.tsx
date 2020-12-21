import React, { useCallback, useContext, useState, useEffect } from "react";
import { Heading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { selectHasAuthenticated } from "../store/state";
import { signUp } from "../store/effects";
import { Button, TextInput, Text } from "react-native";
import { NavigationContext } from "@react-navigation/native";
import { useStore } from "../../../store/state";
import { createCareRoute } from "../../care/components/care-screen";

export const SignUp = () => {
  const { navigate } = useContext(NavigationContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const hasAuthenticated = useStore(selectHasAuthenticated);

  useEffect(() => {
    if (hasAuthenticated) {
      navigate(createCareRoute());
    }
  }, [hasAuthenticated]);

  const handleSignUp = useCallback(async () => {
    await signUp(email, password)();
  }, [email, password]);

  return (
    <ScreenLayout>
      <Heading>Sign up</Heading>

      <Text style={{ color: "white" }}>Email</Text>
      <TextInput style={{ color: "white" }} onChangeText={setEmail} />

      <Text style={{ color: "white" }}>Password</Text>
      <TextInput style={{ color: "white" }} onChangeText={setPassword} />

      <Button title="Sign up" onPress={handleSignUp} />
    </ScreenLayout>
  );
};

export const SIGN_UP_SCREEN = "SIGN_UP_SCREEN";
export const createSignUpRoute = () => SIGN_UP_SCREEN;
