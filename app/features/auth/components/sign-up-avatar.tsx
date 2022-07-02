import { StackScreenProps } from "@react-navigation/stack";
import { Button } from "@urban-jungle/design/components/button";
import {
  Footer,
  ScreenLayout,
} from "@urban-jungle/design/components/layouts/screen-layout";
import { ScreenTitle } from "@urban-jungle/design/components/typography";
import { symbols } from "@urban-jungle/design/theme";
import { ImageModel, makeImageModel } from "@urban-jungle/shared/models/image";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { AUTH_STACK_NAME } from "../../../navigation/stack-names";
import { useRunWithUIState } from "../../../store/ui";
import { CameraButton } from "../../camera/camera-button";
import { useAuthMachine } from "../machine/machine";
import { routeNames } from "./route-names";
import { SplashContainer } from "./splash";

const SignUpName = ({ navigation }: StackScreenProps<{}>) => {
  const { execute } = useAuthMachine();
  const runWithUIState = useRunWithUIState();

  const { registerCameraField, submit } = useForm<{ avatar: ImageModel }>(
    { avatar: makeImageModel() },
    { avatar: [constraints.isRequired, constraints.isString] },
  );

  const handleSignUp = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.map((fields) => {
            execute((ctx) => {
              ctx.avatar = fields.avatar;
            });
          }),
        ),
      ),
    [submit, execute],
  );

  const handleSkip = useCallback(
    () =>
      execute((ctx) => {
        ctx.skipAvatar = true;
      }),
    [],
  );

  return (
    <ScreenLayout
      footer={
        <Footer>
          <EmailButton type="plain" onPress={handleSkip}>
            Skip
          </EmailButton>

          <Button onPress={handleSignUp} large>
            Next
          </Button>
        </Footer>
      }
    >
      <SplashContainer>
        <ScreenTitle title="🌱 Urban Jungle" description="?" />

        <CameraButton viewport {...registerCameraField("avatar")} />
      </SplashContainer>
    </ScreenLayout>
  );
};

const EmailButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8}px;
`;

export const signUpNameRoute = makeNavigationRoute({
  screen: SignUpName,
  stackName: AUTH_STACK_NAME,
  routeName: routeNames.signUpNameRoute,
});
