import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import firebase from "firebase";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback, useRef } from "react";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { env } from "../../../env";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { useManageAuthMachine } from "../machine/machine";
import { getScreenTitle } from "../machine/types";
import { routeNames } from "../route-names";

const ManageProfilePhone = ({ navigation }: StackScreenProps<{}>) => {
  const { context, execute } = useManageAuthMachine();
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const runWithUIState = useRunWithUIState();

  const { registerTextInput, submit } = useForm<{
    phone: string;
  }>(
    {
      phone: context.recentlyAuthenticated
        ? ""
        : context.currentPhoneNumber || "",
    },
    {
      phone: [constraints.isRequired, constraints.isString],
    },
  );

  const handleSubmit = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.chainFirst((fields) =>
            TE.tryCatch(
              async () => {
                const phoneProvider = new firebase.auth.PhoneAuthProvider();
                const verificationId = await phoneProvider.verifyPhoneNumber(
                  fields.phone,
                  recaptchaVerifier.current!,
                );
                execute((ctx) => {
                  ctx.verificationId = verificationId;
                  if (ctx.recentlyAuthenticated) {
                    ctx.newPhoneNumber = fields.phone;
                  } else {
                    ctx.currentPhoneNumber = fields.phone;
                  }
                });
              },
              () => "BAD_REQUEST" as IErr,
            ),
          ),
        ),
      ),
    [submit, execute],
  );

  return (
    <ScreenLayout onBack={navigation.goBack} scrollView={false}>
      <ContentContainer>
        <ScreenTitle
          title={getScreenTitle(context.flow)}
          description={
            context.recentlyAuthenticated
              ? "What's your new phone number"
              : "What's your phone number?"
          }
        />

        <TextField
          {...registerTextInput("phone")}
          textContentType="telephoneNumber"
          autoCompleteType="tel"
          keyboardType="phone-pad"
          returnKeyType="send"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />

        <Button onPress={handleSubmit} large>
          Next
        </Button>
      </ContentContainer>

      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={env.firebase}
        attemptInvisibleVerification
      />
    </ScreenLayout>
  );
};

const ContentContainer = styled.View`
  flex: 1;
  justify-content: space-between;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;

export const manageProfilePhone = makeNavigationRoute({
  screen: ManageProfilePhone,
  routeName: routeNames.manageAuthPhoneRoute,
});
