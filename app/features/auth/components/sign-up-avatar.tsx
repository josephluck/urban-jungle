import { StackScreenProps } from "@react-navigation/stack";
import { ImageModel } from "@urban-jungle/shared/models/image";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { View } from "react-native";
import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { ScreenTitle } from "../../../components/typography";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useRunWithUIState } from "../../../store/ui";
import { useMachine } from "../machine/machine";
import { routeNames } from "./route-names";
import { SplashContainer } from "./splash";

const SignUpName = ({ navigation }: StackScreenProps<{}>) => {
  const { execute } = useMachine();
  const runWithUIState = useRunWithUIState();

  const { registerCameraField, submit } = useForm<{ avatar: ImageModel }>(
    { avatar: "" },
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
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <SplashContainer>
        <ScreenTitle title="🌱 Urban Jungle" description="?" />

        <AvatarField {...registerCameraField("avatar")} />

        <View>
          <EmailButton type="plain" onPress={handleSkip}>
            Skip
          </EmailButton>

          <Button onPress={handleSignUp} large>
            Next
          </Button>
        </View>
      </SplashContainer>
    </BackableScreenLayout>
  );
};

const EmailButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8};
`;

export const signUpNameRoute = makeNavigationRoute({
  screen: SignUpName,
  routeName: routeNames.signUpNameRoute,
});
