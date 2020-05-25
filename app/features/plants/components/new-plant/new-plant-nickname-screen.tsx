import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { Button } from "../../../../components/button";
import { BackableScreenLayout } from "../../../../components/layouts/backable-screen";
import { TextField } from "../../../../components/text-field";
import { ScreenTitle } from "../../../../components/typography";
import { useForm } from "../../../../hooks/use-form";
import { makeNavigationRoute } from "../../../../navigation/make-navigation-route";
import { symbols } from "../../../../theme";
import { PlantFields } from "../../store/effects";
import { managePlantRoute } from "../manage-plant-screen";
import { setPlantFields } from "./state";

type Fields = Pick<Required<PlantFields>, "nickname">;

export const NewPlantNicknameScreen = ({
  navigation,
}: NavigationStackScreenProps) => {
  const { submit, registerTextInput } = useForm<Fields>(
    {
      nickname: "",
    },
    {
      nickname: [],
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
          // TODO: only set nickname if name is set, otherwise set name
          setPlantFields({ nickname });
          return nickname;
        }),
        E.map(() => {
          managePlantRoute.navigateTo(navigation, {});
        })
      ),
    [submit]
  );

  // TODO: support progress bar
  return (
    <BackableScreenLayout
      onBack={handleGoBack}
      footer={
        <Footer>
          <Button large onPress={handleSubmit}>
            Next
          </Button>
        </Footer>
      }
    >
      <ScreenTitle
        title="Set a nickname"
        description="Something you'll remember easily."
      />
      <ScreenContent>
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

const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;

export const newPlantNicknameRoute = makeNavigationRoute({
  screen: NewPlantNicknameScreen,
  routeName: "NEW_PLANT_NICKNAME_SCREEN",
  authenticated: true,
});
