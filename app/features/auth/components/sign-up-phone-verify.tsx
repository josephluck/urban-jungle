import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { Button } from "../../../components/button";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useRunWithUIState } from "../../../store/ui";
import { useAuthMachine } from "../machine/machine";
import { signUpWithPhone } from "../store/effects";
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
    <ScreenLayout onBack={navigation.goBack} scrollView={false}>
      <SplashContainer>
        <ScreenTitle
          title="🌱 Urban Jungle"
          description={`Please enter the code we sent to ${phoneNumber}`}
        />

        <TextField
          {...registerTextInput("verificationCode")}
          returnKeyType="send"
          onSubmitEditing={handleVerify}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button onPress={handleVerify} large>
          Next
        </Button>
      </SplashContainer>
    </ScreenLayout>
  );
};

export const signUpPhoneVerifyRoute = makeNavigationRoute<{}>({
  screen: SignUpPhoneVerify,
  routeName: routeNames.signUpPhoneVerifyRoute,
});
