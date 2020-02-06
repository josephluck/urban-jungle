import React, { useCallback, useContext, useState, useEffect } from "react";
import { Heading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/screen-layout";
import { useAuthStore, selectHasAuthenticated } from "../store/state";
import { signUp } from "../store/effects";
import { Button, TextInput, Text } from "react-native";
import { NavigationContext } from "react-navigation";
import { createHomeRoute } from "../../home/navigation/routes";

export const SignUp = () => {
  const { navigate } = useContext(NavigationContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const hasAuthenticated = useAuthStore(selectHasAuthenticated);

  useEffect(() => {
    if (hasAuthenticated) {
      navigate(createHomeRoute());
    }
  }, [hasAuthenticated]);

  const handleSignUp = useCallback(async () => {
    await signUp(email, password);
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
