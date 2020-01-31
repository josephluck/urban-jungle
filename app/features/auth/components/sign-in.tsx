import React, { useCallback, useContext, useState, useEffect } from "react";
import { Heading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/screen-layout";
import { signIn, useAuthStore, selectHasAuthenticated } from "../store";
import { Button, TextInput, Text } from "react-native";
import { NavigationContext } from "react-navigation";
import { createHomeRoute } from "../../home/navigation/routes";

export const SignIn = () => {
  const { navigate } = useContext(NavigationContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const hasAuthenticated = useAuthStore(selectHasAuthenticated);

  useEffect(() => {
    if (hasAuthenticated) {
      navigate(createHomeRoute());
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
