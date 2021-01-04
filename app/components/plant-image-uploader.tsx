import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";
import styled from "styled-components/native";
import { savePlantImage } from "../features/plants/store/effects";
import { symbols } from "../theme";
import { CameraButton } from "./camera-button";

export const PlantImageUploader = ({
  householdId,
  plantId,
}: {
  householdId: string;
  plantId: string;
}) => {
  const handleSubmit = (imageInfo: ImageInfo) => {
    pipe(savePlantImage(householdId, plantId, O.fromNullable(imageInfo)))();
  };

  return <PlantCameraButton type="plant" onChange={handleSubmit} />;
};

const PlantCameraButton = styled(CameraButton)`
  border-radius: ${symbols.borderRadius.large};
`;
