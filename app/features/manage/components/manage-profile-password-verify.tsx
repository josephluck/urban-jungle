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
import { updateUserPassword } from "../../auth/store/effects";
import { manageRoute } from "./manage-screen";

const ManageProfilePasswordVerify = ({
  navigation,
  route,
}: StackScreenProps<
  Record<keyof ManageProfilePasswordVerifyParams, never>
>) => {
  const runWithUIState = useRunWithUIState();
  const { password } = manageProfilePasswordVerify.getParams(route);

  const { registerTextInput, submit } = useForm<{
    newPassword: string;
  }>(
    {
      newPassword: "",
    },
    {
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
                updateUserPassword(password, fields.newPassword),
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
    [submit, password],
  );

  return (
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <ContentContainer>
        <ScreenTitle
          title="Change password"
          description="Choose a new password"
        />
        <TextField
          {...registerTextInput("newPassword")}
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

type ManageProfilePasswordVerifyParams = {
  password: string;
};

export const manageProfilePasswordVerify = makeNavigationRoute<ManageProfilePasswordVerifyParams>(
  {
    screen: ManageProfilePasswordVerify,
    routeName: "MANAGE_PROFILE_PASSWORD_VERIFY",
  },
);
