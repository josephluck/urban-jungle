import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as O from "fp-ts/lib/Option";
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
import { useStore } from "../../../store/state";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { updateUserEmailAndPassword } from "../../auth/store/effects";
import { selectCurrentProfileEmail } from "../../profiles/store/state";

const ManageProfileEmail = ({ navigation }: StackScreenProps<{}>) => {
  const runWithUIState = useRunWithUIState();
  const profileEmail = useStore(selectCurrentProfileEmail);

  const { registerTextInput, submit } = useForm<{
    email: string;
    currentPassword: string;
    newPassword: string;
  }>(
    {
      email: pipe(
        profileEmail,
        O.getOrElse(() => ""),
      ),
      currentPassword: "",
      newPassword: "",
    },
    {
      email: [constraints.isRequired, constraints.isString],
      currentPassword: [constraints.isRequired, constraints.isString],
      newPassword: [constraints.isRequired, constraints.isString],
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
              pipe(
                updateUserEmailAndPassword(
                  fields.email,
                  fields.currentPassword,
                  fields.newPassword,
                ),
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
          autoCapitalize="none"
          autoCorrect={false}
        />

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

export const manageProfileEmail = makeNavigationRoute({
  screen: ManageProfileEmail,
  routeName: "MANAGE_PROFILE_EMAIL",
});
