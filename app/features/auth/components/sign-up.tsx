import React, { useCallback, useContext, useState } from "react";
import { Heading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/screen-layout";
import { signUp } from "../../auth/store";
import { Button, TextInput, Text } from "react-native";
import { NavigationContext } from "react-navigation";
import { createHomeRoute } from "../../home/navigation/routes";

export const SignUp = () => {
  const { navigate } = useContext(NavigationContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const toHome = useCallback(() => {
    navigate(createHomeRoute());
  }, []);

  const handleSignUp = useCallback(async () => {
    await signUp(email, password);
    toHome();
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
