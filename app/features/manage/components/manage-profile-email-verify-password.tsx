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
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { updateUserEmail } from "../../auth/store/effects";
import { manageRoute } from "./manage-screen";

const ManageProfileEmailVerifyPassword = ({
  navigation,
  route,
}: StackScreenProps<
  Record<keyof ManageProfileEmailVerifyPasswordParams, never>
>) => {
  const { email } = manageProfileEmailVerifyPassword.getParams(route);
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{
    currentPassword: string;
  }>(
    {
      currentPassword: "",
    },
    {
      currentPassword: [constraints.isRequired, constraints.isString],
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
                updateUserEmail(fields.currentPassword, email),
                TE.map(() =>
                  InteractionManager.runAfterInteractions(() =>
                    manageRoute.navigateTo(navigation, {}),
                  ),
                ),
              ),
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
          title="Change email address"
          description="Please verify your password"
        />

        <TextField
          {...registerTextInput("currentPassword")}
          textContentType="password"
          secureTextEntry
          returnKeyType="send"
          autoCapitalize="none"
          onSubmitEditing={handleSubmit}
          autoCorrect={false}
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

type ManageProfileEmailVerifyPasswordParams = {
  email: string;
};

export const manageProfileEmailVerifyPassword = makeNavigationRoute<ManageProfileEmailVerifyPasswordParams>(
  {
    screen: ManageProfileEmailVerifyPassword,
    routeName: "MANAGE_PROFILE_EMAIL_VERIFY_PASSWORD",
  },
);
