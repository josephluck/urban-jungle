import { StackScreenProps } from "@react-navigation/stack";
import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback, useState } from "react";
import styled from "styled-components/native";
import { Button } from "../../../../components/button";
import { trimBase64FromImage, useCamera } from "../../../../components/camera";
import { CircleButton, CircleImage } from "../../../../components/circle-image";
import { Icon } from "../../../../components/icon";
import {
  ContentContainer,
  Footer,
  ScreenLayout,
} from "../../../../components/layouts/screen-layout";
import { ScreenTitle } from "../../../../components/typography";
import { makeNavigationRoute } from "../../../../navigation/make-navigation-route";
import { PLANTS_STACK_NAME } from "../../../../navigation/stack-names";
import { identifyPlantFromImages } from "../../../../store/effects";
import { useRunWithUIState } from "../../../../store/ui";
import { symbols } from "../../../../theme";
import { newPlantNicknameRoute } from "./new-plant-nickname-screen";
import { newPlantSuggestionRoute } from "./new-plant-suggestion-screen";
import { setIdentificationResult, setPlantFields } from "./state";

export const NewPlantPictureScreen = ({ navigation }: StackScreenProps<{}>) => {
  const runWithUIState = useRunWithUIState();
  const requiredImages: number = 1; // TODO: tweak this depending on the quality of Plant.id. The more images, the better.
  const [images, setImages] = useState<ImageInfo[]>([]);

  const { takeModalPictureAndUpload } = useCamera();

  const handleTakePicture = useCallback(() => {
    runWithUIState(
      pipe(
        takeModalPictureAndUpload("plant"),
        TE.map((image) => {
          setImages((curr) => [...curr, image]);
        }),
      ),
    );
  }, []);

  const handleRemoveImage = useCallback((image: ImageInfo) => {
    setImages((curr) => curr.filter((img) => img.uri !== image.uri));
  }, []);

  const handleSubmitMultipleImages = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.right(images),
          TE.map((images) => {
            setPlantFields({ avatar: trimBase64FromImage(images[0]) });
            return images;
          }),
          TE.chain(identifyPlantFromImages),
          TE.map((result) => {
            setIdentificationResult(result);
            return result;
          }),
          TE.map(() => {
            newPlantSuggestionRoute.navigateTo(navigation, {});
          }),
        ),
      ),
    [images.length],
  );

  const handleTakePictureAndSubmit = useCallback(
    () =>
      runWithUIState(
        pipe(
          takeModalPictureAndUpload("plant"),
          TE.map((image) => [image]),
          TE.map((images) => {
            setPlantFields({ avatar: trimBase64FromImage(images[0]) });
            return images;
          }),
          TE.chain(identifyPlantFromImages),
          TE.map((result) => {
            setIdentificationResult(result);
            return result;
          }),
          TE.map(() => {
            newPlantSuggestionRoute.navigateTo(navigation, {});
          }),
        ),
      ),
    [],
  );

  const handleSkip = useCallback(
    () => newPlantNicknameRoute.navigateTo(navigation, {}),
    [],
  );

  return (
    <ScreenLayout
      progress={20}
      footer={
        <Footer>
          <SkipButton type="plain" onPress={handleSkip}>
            Skip
          </SkipButton>
          {requiredImages === 1 ? (
            <Button large onPress={handleTakePictureAndSubmit}>
              Grab a picture
            </Button>
          ) : (
            <Button
              large
              disabled={images.length < requiredImages}
              onPress={handleSubmitMultipleImages}
            >
              Next
            </Button>
          )}
        </Footer>
      }
    >
      <ContentContainer>
        <ScreenTitle
          title={requiredImages > 1 ? "Grab some pictures" : "Grab a picture"}
          description={
            requiredImages > 1
              ? `Snap ${requiredImages} pictures of your plant, we'll scan them and fill in the details.`
              : "Let's start with a picture of your plant. We'll scan it and fill in the details."
          }
        />
        <ImagesList>
          {images.map((image) => (
            <ImageWrapper key={image.uri}>
              <CircleImage
                size={100}
                uri={image.uri ? image.uri : ""}
                withDeleteBadge
                onPress={() => handleRemoveImage(image)}
              />
            </ImageWrapper>
          ))}
          {requiredImages > 1 && images.length < requiredImages ? (
            <ImageWrapper>
              <CircleButton size={100} onPress={handleTakePicture}>
                <Icon icon="plus" size={32} />
              </CircleButton>
            </ImageWrapper>
          ) : null}
        </ImagesList>
      </ContentContainer>
    </ScreenLayout>
  );
};

const ImagesList = styled.View`
  align-items: center;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
`;

const ImageWrapper = styled.View`
  margin: ${symbols.spacing._6}px;
`;

const SkipButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8}px;
`;

export const newPlantPictureRoute = makeNavigationRoute({
  screen: NewPlantPictureScreen,
  stackName: PLANTS_STACK_NAME,
  routeName: "NEW_PLANT_PICTURE_SCREEN",
});
