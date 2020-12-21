import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { Button } from "../../../../components/button";
import { BackableScreenLayout } from "../../../../components/layouts/backable-screen";
import { TextField } from "../../../../components/text-field";
import { ScreenTitle } from "../../../../components/typography";
import { useForm, constraints } from "../../../../hooks/use-form";
import { makeNavigationRoute } from "../../../../navigation/make-navigation-route";
import { symbols } from "../../../../theme";
import { PlantFields } from "../../store/effects";
import { newPlantLocationRoute } from "./new-plant-location-screen";
import { setPlantFields, selectPlantFields } from "./state";
import { useStore } from "../../../../store/state";

type Fields = Pick<Required<PlantFields>, "nickname">;

export const NewPlantNicknameScreen = ({
  navigation,
}: StackScreenProps<{}>) => {
  const plantFields = useStore(selectPlantFields);
  /**
   * If there's a name it means the user's chosen to use identification and has
   * picked a suggestion (the name auto populates when this happens).
   * So the user can choose to pick a nickname for the plant.
   */
  const isNickname = Boolean(plantFields.name);

  const { submit, registerTextInput } = useForm<Fields>(
    {
      nickname: "",
    },
    {
      nickname: isNickname ? [] : [constraints.isRequired],
    }
  );

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleSubmit = useCallback(
    () =>
      pipe(
        submit(),
        E.map(({ nickname }) => {
          if (isNickname) {
            setPlantFields({ nickname });
          } else {
            setPlantFields({ name: nickname });
          }
        }),
        E.map(() => {
          newPlantLocationRoute.navigateTo(navigation, {});
        })
      ),
    [submit, isNickname]
  );

  const handleSkip = useCallback(
    () => newPlantLocationRoute.navigateTo(navigation, {}),
    []
  );

  // TODO: support progress bar
  return (
    <BackableScreenLayout
      onBack={handleGoBack}
      progress={60}
      footer={
        <Footer>
          {isNickname ? (
            <SkipButton type="plain" onPress={handleSkip}>
              Skip
            </SkipButton>
          ) : null}
          <Button large onPress={handleSubmit}>
            Next
          </Button>
        </Footer>
      }
    >
      <ScreenContent>
        <ScreenTitle
          title="Give it a name"
          description="Try something you'll remember easily."
        />
        <TextField {...registerTextInput("nickname")} autoFocus />
      </ScreenContent>
    </BackableScreenLayout>
  );
};

const ScreenContent = styled.View`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;

const SkipButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8}px;
`;

const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;

export const newPlantNicknameRoute = makeNavigationRoute({
  screen: NewPlantNicknameScreen,
  routeName: "NEW_PLANT_NICKNAME_SCREEN",
  authenticated: true,
});
