import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { Button } from "../../../../components/button";
import { BackableScreenLayout } from "../../../../components/layouts/backable-screen";
import { ScreenTitle } from "../../../../components/typography";
import { makeNavigationRoute } from "../../../../navigation/make-navigation-route";
import { runWithUIState } from "../../../../store/ui";
import { symbols } from "../../../../theme";
import { identify } from "../../../identify/effects";
import { takeAndUploadPicture } from "../../../photos/camera";
import { newPlantNicknameRoute } from "./new-plant-nickname-screen";
import { newPlantSuggestionRoute } from "./new-plant-suggestion-screen";
import { setIdentificationResult, setPlantFields } from "./state";

export const NewPlantPictureScreen = ({
  navigation,
}: NavigationStackScreenProps) => {
  const handleGoBack = useCallback(() => {
    // TODO: this should reset the state of the new plant workflow
    navigation.goBack();
  }, []);

  const handleSubmit = useCallback(
    () =>
      runWithUIState(
        pipe(
          takeAndUploadPicture("plant", { base64: true }),
          TE.map((image) => {
            setPlantFields({ avatar: image });
            return image;
          }),
          TE.chain(identify),
          TE.map((result) => {
            setIdentificationResult(result);
            return result;
          }),
          TE.map(() => {
            newPlantSuggestionRoute.navigateTo(navigation, {});
          })
        )
      ),
    []
  );

  const handleSkip = useCallback(
    () => newPlantNicknameRoute.navigateTo(navigation, {}),
    []
  );

  // TODO: support progress bar
  return (
    <BackableScreenLayout
      onBack={handleGoBack}
      footer={
        <Footer>
          <SkipButton type="plain" onPress={handleSkip}>
            Skip
          </SkipButton>
          <Button large onPress={handleSubmit}>
            Grab a picture
          </Button>
        </Footer>
      }
    >
      <ScreenTitle
        title="Grab a picture!"
        description="Snap a picture of your plant, we'll scan it and automatically add it to your collection."
      />
    </BackableScreenLayout>
  );
};

const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;

const SkipButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8}px;
`;

export const newPlantPictureRoute = makeNavigationRoute({
  screen: NewPlantPictureScreen,
  routeName: "NEW_PLANT_PICTURE_SCREEN",
  authenticated: true,
});
