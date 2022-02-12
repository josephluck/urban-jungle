import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { View } from "react-native";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { MANAGE_STACK_NAME } from "../../../navigation/stack-names";
import { signInWithPhone } from "../../../store/effects";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
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
        <View
          style={{
            paddingHorizontal: symbols.spacing.appHorizontal,
            paddingVertical: symbols.spacing._16,
          }}
        >
          <Button onPress={handleSubmit} large>
            Next
          </Button>
        </View>
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
