import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import {
  Footer,
  ScreenLayout,
} from "../../../components/layouts/screen-layout";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { MANAGE_STACK_NAME } from "../../../navigation/stack-names";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { useManageAuthMachine } from "../machine/machine";
import { getScreenTitle } from "../machine/types";
import { routeNames } from "../route-names";

const ManageProfileEmail = ({ navigation }: StackScreenProps<{}>) => {
  const runWithUIState = useRunWithUIState();
  const { context, execute } = useManageAuthMachine();

  const { registerTextInput, submit } = useForm<{
    email: string;
  }>(
    {
      email: context.recentlyAuthenticated
        ? ""
        : context.currentEmailAddress || "",
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
            execute((ctx) => {
              if (context.recentlyAuthenticated) {
                ctx.newEmailAddress = fields.email;
              } else {
                ctx.currentEmailAddress = fields.email;
              }
            });
          }),
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
            context.recentlyAuthenticated
              ? "What is your new email address?"
              : "What is your email address?"
          }
        />
        <TextField
          {...registerTextInput("email")}
          textContentType="emailAddress"
          autoCompleteType="email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
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

export const manageProfileEmail = makeNavigationRoute({
  screen: ManageProfileEmail,
  stackName: MANAGE_STACK_NAME,
  routeName: routeNames.manageAuthEmailRoute,
});
