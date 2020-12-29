import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { addEmailAndPasswordCredentials } from "../../auth/store/effects";

const AddProfilePassword = ({
  navigation,
  route,
}: StackScreenProps<Record<keyof AddProfilePasswordParams, never>>) => {
  const { email } = addProfilePassword.getParams(route);
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{
    password: string;
  }>(
    {
      password: "",
    },
    {
      password: [constraints.isRequired, constraints.isString],
    },
  );

  const handleSubmit = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.map((fields) => {
            runWithUIState(
              addEmailAndPasswordCredentials(email, fields.password),
            );
          }),
        ),
      ),
    [submit, email],
  );

  return (
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <ContentContainer>
        <ScreenTitle
          title="Add email address"
          description="Please choose a password"
        />
        <TextField
          {...registerTextInput("password")}
          textContentType="password"
          secureTextEntry
          returnKeyType="send"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleSubmit}
        />

        <Button onPress={handleSubmit} large>
          Save
        </Button>
      </ContentContainer>
    </BackableScreenLayout>
  );
};

const ContentContainer = styled.View`
  flex: 1;
  justify-content: space-between;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;

type AddProfilePasswordParams = {
  email: string;
};

export const addProfilePassword = makeNavigationRoute<AddProfilePasswordParams>(
  {
    screen: AddProfilePassword,
    routeName: "ADD_PROFILE_PASSWORD",
  },
);
