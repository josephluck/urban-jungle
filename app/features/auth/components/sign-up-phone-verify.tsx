import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { View } from "react-native";
import { Button } from "../../../components/button";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { AUTH_STACK_NAME } from "../../../navigation/stack-names";
import { signUpWithPhone } from "../../../store/effects";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { useAuthMachine } from "../machine/machine";
import { routeNames } from "./route-names";
import { SplashContainer } from "./splash";

const SignUpPhoneVerify = ({ navigation }: StackScreenProps<{}>) => {
  const {
    execute,
    context: { verificationId, phoneNumber },
  } = useAuthMachine();
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{ verificationCode: string }>(
    { verificationCode: "" },
    {
      verificationCode: [constraints.isString],
    },
  );

  const handleVerify = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.chainFirst((fields) =>
            signUpWithPhone(verificationId!, fields.verificationCode),
          ),
          TE.map((fields) =>
            execute((ctx) => {
              ctx.verificationCode = fields.verificationCode;
            }),
          ),
        ),
      ),
    [submit, execute, verificationId],
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
          <Button onPress={handleVerify} large>
            Next
          </Button>
        </View>
      }
    >
      <SplashContainer>
        <ScreenTitle
          title="🌱 Urban Jungle"
          description={`Please enter the code we sent to ${phoneNumber}`}
        />

        <TextField
          {...registerTextInput("verificationCode")}
          returnKeyType="send"
          onSubmitEditing={handleVerify}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </SplashContainer>
    </ScreenLayout>
  );
};

export const signUpPhoneVerifyRoute = makeNavigationRoute<{}>({
  screen: SignUpPhoneVerify,
  stackName: AUTH_STACK_NAME,
  routeName: routeNames.signUpPhoneVerifyRoute,
});
