import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";
import styled from "styled-components/native";
import { savePlantImage } from "../features/plants/store/effects";
import { symbols } from "../theme";
import { CameraField } from "./camera-field";

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

  return <CameraButton type="plant" onChange={handleSubmit} />;
};

const CameraButton = styled(CameraField)`
  border-radius: ${symbols.borderRadius.large};
`;
