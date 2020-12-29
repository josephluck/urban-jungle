import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { TextField } from "../../../components/text-field";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { linkWithEmailCredential } from "../../auth/store/effects";

const AddProfileEmail = ({ navigation }: StackScreenProps<{}>) => {
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{
    email: string;
    password: string;
  }>(
    {
      email: "",
      password: "",
    },
    {
      email: [constraints.isRequired, constraints.isString],
      password: [constraints.isRequired, constraints.isString],
    },
  );

  const handleSignUp = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.map((fields) => {
            runWithUIState(
              linkWithEmailCredential(fields.email, fields.password),
            );
          }),
        ),
      ),
    [submit],
  );

  return (
    <BackableScreenLayout
      onBack={navigation.goBack}
      footer={
        <Footer>
          <Button onPress={handleSignUp} large>
            Save
          </Button>
        </Footer>
      }
    >
      <ContentContainer>
        <TextField
          {...registerTextInput("email")}
          label="Email address"
          textContentType="emailAddress"
          autoCompleteType="email"
          keyboardType="email-address"
          returnKeyType="send"
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextField
          {...registerTextInput("password")}
          label="Password"
          textContentType="password"
          secureTextEntry
          returnKeyType="send"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </ContentContainer>
    </BackableScreenLayout>
  );
};

const ContentContainer = styled.View`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;

const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;

export const addProfileEmail = makeNavigationRoute({
  screen: AddProfileEmail,
  routeName: "ADD_PROFILE_EMAIL",
});
