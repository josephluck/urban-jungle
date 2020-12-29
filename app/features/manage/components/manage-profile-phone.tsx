import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback, useRef } from "react";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { TextField } from "../../../components/text-field";
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { selectAuthProviderPhone } from "../../auth/store/state";
import { selectCurrentProfilePhone } from "../../profiles/store/state";
import { manageProfilePhoneVerify } from "./manage-profile-phone-verify";

const ManageProfilePhone = ({ navigation }: StackScreenProps<{}>) => {
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const runWithUIState = useRunWithUIState();
  const profilePhone = useStore(selectCurrentProfilePhone);
  const alreadyHasPhoneAuth = pipe(useStore(selectAuthProviderPhone), O.isSome);

  const { registerTextInput, submit } = useForm<{
    phone: string;
  }>(
    {
      phone: pipe(
        profilePhone,
        O.getOrElse(() => ""),
      ),
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
                manageProfilePhoneVerify.navigateTo(navigation, {
                  verificationId,
                  phoneNumber: fields.phone,
                });
              },
              () => "BAD_REQUEST" as IErr,
            ),
          ),
        ),
      ),
    [submit],
  );

  return (
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <ContentContainer>
        <ScreenTitle
          title={
            alreadyHasPhoneAuth ? "Change phone number" : "Add phone number"
          }
          description={
            alreadyHasPhoneAuth
              ? "What is your new phone number"
              : "What is your phone number?"
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
    </BackableScreenLayout>
  );
};

const ContentContainer = styled.View`
  flex: 1;
  justify-content: space-between;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;

export const manageProfilePhone = makeNavigationRoute({
  screen: ManageProfilePhone,
  routeName: "MANAGE_PROFILE_PHONE",
});
