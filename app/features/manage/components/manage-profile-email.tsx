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
import { manageProfileEmailVerifyPassword } from "./manage-profile-email-verify-password";

const ManageProfileEmail = ({ navigation }: StackScreenProps<{}>) => {
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{
    email: string;
  }>(
    {
      email: "",
    },
    {
      email: [constraints.isRequired, constraints.isString],
    },
  );

  const handleSubmit = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.map((fields) => {
            manageProfileEmailVerifyPassword.navigateTo(navigation, {
              email: fields.email,
            });
          }),
        ),
      ),
    [submit],
  );

  return (
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <ContentContainer>
        <ScreenTitle
          title="Change email address"
          description="What's your new email address?"
        />
        <TextField
          {...registerTextInput("email")}
          textContentType="emailAddress"
          autoCompleteType="email"
          keyboardType="email-address"
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
        />

        <Button onPress={handleSubmit} large>
          Next
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

export const manageProfileEmail = makeNavigationRoute({
  screen: ManageProfileEmail,
  routeName: "MANAGE_PROFILE_EMAIL",
});
