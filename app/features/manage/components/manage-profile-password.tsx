import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import {
  ContextMenuDotsButton,
  ContextMenuIconButton,
  useContextMenu,
} from "../../../components/context-menu";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { removeEmailAuth } from "../../auth/store/effects";
import { selectHasMultipleAuthProviders } from "../../auth/store/state";
import { manageProfilePasswordVerify } from "./manage-profile-password-verify";

const ManageProfilePassword = ({ navigation }: StackScreenProps<{}>) => {
  const runWithUIState = useRunWithUIState();
  const { hide: closeContextMenu } = useContextMenu();
  const hasMultipleAuthProviders = useStore(selectHasMultipleAuthProviders);

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
          TE.map((fields) =>
            manageProfilePasswordVerify.navigateTo(navigation, {
              password: fields.currentPassword,
            }),
          ),
        ),
      ),
    [submit, navigation],
  );

  const handleRemoveEmailAuth = useCallback(
    () => runWithUIState(pipe(removeEmailAuth(), TE.map(navigation.goBack))),
    [],
  );

  return (
    <BackableScreenLayout
      onBack={navigation.goBack}
      scrollView={false}
      headerRightButton={
        hasMultipleAuthProviders ? (
          <ContextMenuDotsButton menuId="remove-profile-password">
            {[
              <ContextMenuIconButton
                icon="trash"
                onPress={handleRemoveEmailAuth}
              >
                Remove email auth
              </ContextMenuIconButton>,
              <ContextMenuIconButton onPress={closeContextMenu}>
                Cancel
              </ContextMenuIconButton>,
            ]}
          </ContextMenuDotsButton>
        ) : null
      }
    >
      <ContentContainer>
        <ScreenTitle
          title="Change password"
          description="What's your current password?"
        />
        <TextField
          {...registerTextInput("currentPassword")}
          textContentType="password"
          secureTextEntry
          autoFocus
          returnKeyType="send"
          autoCapitalize="none"
          onSubmitEditing={handleSubmit}
          autoCorrect={false}
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

export const manageProfilePassword = makeNavigationRoute({
  screen: ManageProfilePassword,
  routeName: "MANAGE_PROFILE_PASSWORD",
});
