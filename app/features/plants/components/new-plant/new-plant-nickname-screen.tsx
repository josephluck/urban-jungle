import { StackScreenProps } from "@react-navigation/stack";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { Button } from "../../../../components/button";
import {
  ContentContainer,
  Footer,
  ScreenLayout,
} from "../../../../components/layouts/screen-layout";
import { TextField } from "../../../../components/text-field";
import { ScreenTitle } from "../../../../components/typography";
import { constraints, useForm } from "../../../../hooks/use-form";
import { makeNavigationRoute } from "../../../../navigation/make-navigation-route";
import { PLANTS_STACK_NAME } from "../../../../navigation/stack-names";
import { PlantFields } from "../../../../store/effects";
import { useStore } from "../../../../store/state";
import { symbols } from "../../../../theme";
import { newPlantLocationRoute } from "./new-plant-location-screen";
import { selectPlantFields, setPlantFields } from "./state";

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
    },
  );

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
        }),
      ),
    [submit, isNickname],
  );

  const handleSkip = useCallback(
    () => newPlantLocationRoute.navigateTo(navigation, {}),
    [],
  );

  return (
    <ScreenLayout
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
      <ContentContainer>
        <ScreenTitle
          title="Give it a name"
          description="Try something you'll remember easily."
        />
        <TextField {...registerTextInput("nickname")} />
      </ContentContainer>
    </ScreenLayout>
  );
};

const SkipButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8}px;
`;

export const newPlantNicknameRoute = makeNavigationRoute({
  screen: NewPlantNicknameScreen,
  stackName: PLANTS_STACK_NAME,
  routeName: "NEW_PLANT_NICKNAME_SCREEN",
});
