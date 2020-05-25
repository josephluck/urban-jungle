import { ImageModel, makeImageModel } from "@urban-jungle/shared/models/image";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { Button } from "../../../../components/button";
import { BackableScreenLayout } from "../../../../components/layouts/backable-screen";
import { ScreenTitle } from "../../../../components/typography";
import { useForm } from "../../../../hooks/use-form";
import { makeNavigationRoute } from "../../../../navigation/make-navigation-route";
import { useStore } from "../../../../store/state";
import { runWithUIState } from "../../../../store/ui";
import { symbols } from "../../../../theme";
import { selectedSelectedOrMostRecentHouseholdId } from "../../../households/store/state";
import { identify } from "../../../identify/effects";
import { takeAndUploadPicture } from "../../../photos/camera";
import { managePlantRoute } from "../manage-plant-screen";

type Fields = {
  avatar: ImageModel;
};

export const NewPlantPictureScreen = ({
  navigation,
}: NavigationStackScreenProps) => {
  const { submit, setValue } = useForm<Fields>(
    {
      avatar: makeImageModel(),
    },
    { avatar: [] }
  );

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );

  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleTakePicture = useCallback(
    () =>
      runWithUIState(
        pipe(
          takeAndUploadPicture("plant", { base64: true }),
          TE.map((image) => {
            setValue("avatar", image);
            return image;
          }),
          TE.chain(identify),
          TE.map((data) => {
            console.log("Navigating", { data });
            managePlantRoute.navigateTo(navigation, {});
          })
        )
      ),
    [selectedHouseholdId, submit]
  );

  const handleSkip = useCallback(
    () => managePlantRoute.navigateTo(navigation, {}),
    []
  );

  return (
    <BackableScreenLayout
      onBack={handleGoBack}
      footer={
        <Footer>
          <SkipButton type="plain" onPress={handleSkip}>
            Skip
          </SkipButton>
          <Button large onPress={handleTakePicture}>
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
