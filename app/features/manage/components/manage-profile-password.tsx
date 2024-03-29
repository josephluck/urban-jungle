import { StackScreenProps } from "@react-navigation/stack";
import { Button } from "@urban-jungle/design/components/button";
import {
  Footer,
  ScreenLayout,
} from "@urban-jungle/design/components/layouts/screen-layout";
import { TextField } from "@urban-jungle/design/components/text-field";
import { ScreenTitle } from "@urban-jungle/design/components/typography";
import { symbols } from "@urban-jungle/design/theme";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { MANAGE_STACK_NAME } from "../../../navigation/stack-names";
import { signInWithEmail } from "../../../store/effects";
import { useRunWithUIState } from "../../../store/ui";
import { useManageAuthMachine } from "../machine/machine";
import { getScreenTitle } from "../machine/types";
import { routeNames } from "../route-names";

const ManageProfilePassword = ({ navigation }: StackScreenProps<{}>) => {
  const runWithUIState = useRunWithUIState();
  const { context, execute } = useManageAuthMachine();

  const { registerTextInput, submit, setValue } = useForm<{
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
          TE.chain((fields) => {
            if (context.recentlyAuthenticated) {
              execute((ctx) => {
                ctx.newPassword = fields.password;
              });
              return TE.right(fields);
            }
            return pipe(
              signInWithEmail(context.currentEmailAddress!, fields.password),
              TE.map(() =>
                execute((ctx) => {
                  ctx.currentPassword = fields.password;
                  ctx.recentlyAuthenticated = true;
                }),
              ),
              TE.map(() => fields),
            );
          }),
          TE.map(() => setValue("password", "")),
        ),
      ),
    [submit, execute, context],
  );

  return (
    <ScreenLayout
      footer={
        <Footer>
          <Button onPress={handleSubmit} large>
            Next
          </Button>
        </Footer>
      }
    >
      <ContentContainer>
        <ScreenTitle
          title={getScreenTitle(context.flow)}
          description={
            !context.recentlyAuthenticated
              ? "What's your password"
              : context.flow === "ADD_EMAIL_AUTH"
              ? "Please choose a password"
              : "Please choose a new password"
          }
        />
        <TextField
          {...registerTextInput("password")}
          textContentType="password"
          secureTextEntry
          returnKeyType="send"
          autoCapitalize="none"
          onSubmitEditing={handleSubmit}
          autoCorrect={false}
        />
      </ContentContainer>
    </ScreenLayout>
  );
};

const ContentContainer = styled.View`
  flex: 1;
  justify-content: space-between;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;

export const manageProfilePassword = makeNavigationRoute({
  screen: ManageProfilePassword,
  stackName: MANAGE_STACK_NAME,
  routeName: routeNames.manageAuthPasswordRoute,
});
