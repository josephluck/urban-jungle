import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { InteractionManager } from "react-native";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { TextField } from "../../../components/text-field";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { updateUserPassword } from "../../auth/store/effects";

const ManageProfilePassword = ({ navigation }: StackScreenProps<{}>) => {
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{
    currentPassword: string;
    newPassword: string;
  }>(
    {
      currentPassword: "",
      newPassword: "",
    },
    {
      currentPassword: [constraints.isRequired, constraints.isString],
      newPassword: [constraints.isRequired, constraints.isString],
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
              pipe(
                updateUserPassword(fields.currentPassword, fields.newPassword),
                TE.map(() =>
                  InteractionManager.runAfterInteractions(navigation.goBack),
                ),
              ),
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
          <Button onPress={handleSubmit} large>
            Save
          </Button>
        </Footer>
      }
    >
      <ContentContainer>
        <TextField
          {...registerTextInput("currentPassword")}
          label="Current password"
          textContentType="password"
          secureTextEntry
          autoFocus
          returnKeyType="send"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextField
          {...registerTextInput("newPassword")}
          label="New password"
          textContentType="password"
          secureTextEntry
          returnKeyType="send"
          autoCapitalize="none"
          onSubmitEditing={handleSubmit}
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

export const manageProfilePassword = makeNavigationRoute({
  screen: ManageProfilePassword,
  routeName: "MANAGE_PROFILE_PASSWORD",
});
