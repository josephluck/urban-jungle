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
import { signInWithPhone } from "../../../store/effects";
import { useRunWithUIState } from "../../../store/ui";
import { useManageAuthMachine } from "../machine/machine";
import { getScreenTitle } from "../machine/types";
import { routeNames } from "../route-names";

const ManageProfilePhoneVerify = ({ navigation }: StackScreenProps<{}>) => {
  const { context, execute } = useManageAuthMachine();

  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{
    verificationCode: string;
  }>(
    {
      verificationCode: "",
    },
    {
      verificationCode: [constraints.isRequired, constraints.isString],
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
                ctx.verificationCode = fields.verificationCode;
              });
              return TE.right(fields);
            }
            return pipe(
              signInWithPhone(context.verificationId!, fields.verificationCode),
              TE.map(() =>
                execute((ctx) => {
                  ctx.verificationCode = fields.verificationCode;
                  ctx.recentlyAuthenticated = true;
                }),
              ),
              TE.map(() => fields),
            );
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
          description={`Please enter the code we sent to ${
            context.recentlyAuthenticated
              ? context.newPhoneNumber
              : context.currentPhoneNumber
          }`}
        />

        <TextField
          {...registerTextInput("verificationCode")}
          autoCompleteType="off"
          returnKeyType="send"
          autoCapitalize="none"
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

export const manageProfilePhoneVerify = makeNavigationRoute({
  screen: ManageProfilePhoneVerify,
  stackName: MANAGE_STACK_NAME,
  routeName: routeNames.manageAuthPhoneVerifyRoute,
});
