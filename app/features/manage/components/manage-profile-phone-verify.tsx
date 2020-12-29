import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
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
import { updateUserPhone } from "../../auth/store/effects";
import { selectAuthProviderPhone } from "../../auth/store/state";
import { manageRoute } from "./manage-screen";

const ManageProfilePhoneVerify = ({
  navigation,
  route,
}: StackScreenProps<Record<keyof ManageProfilePhoneVerifyParams, never>>) => {
  const { verificationId, phoneNumber } = manageProfilePhoneVerify.getParams(
    route,
  );
  const alreadyHasPhoneAuth = pipe(useStore(selectAuthProviderPhone), O.isSome);

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
          TE.chainFirst((fields) =>
            TE.tryCatch(
              async () => {
                updateUserPhone(verificationId, fields.verificationCode);
              },
              () => "BAD_REQUEST" as IErr,
            ),
          ),
          TE.map(() => manageRoute.navigateTo(navigation, {})),
        ),
      ),
    [submit, verificationId, navigation],
  );

  return (
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <ContentContainer>
        <ScreenTitle
          title={
            alreadyHasPhoneAuth ? "Change phone number" : "Add phone number"
          }
          description={`Please enter the code we sent to ${phoneNumber}`}
        />

        <TextField
          {...registerTextInput("verificationCode")}
          label="Verification code"
          autoCompleteType="off"
          returnKeyType="send"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />

        <Button onPress={handleSubmit} large>
          Send
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

type ManageProfilePhoneVerifyParams = {
  verificationId: string;
  phoneNumber: string;
};

export const manageProfilePhoneVerify = makeNavigationRoute<ManageProfilePhoneVerifyParams>(
  {
    screen: ManageProfilePhoneVerify,
    routeName: "MANAGE_PROFILE_PHONE_VERIFY",
  },
);
