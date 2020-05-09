import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";

export const PlantImage = ({ uri }: { uri?: string }) => (
  <>{uri ? <Img source={{ uri }} /> : <Placeholder />}</>
);

const Img = styled.Image`
  width: 100%;
  border-radius: ${symbols.borderRadius.large}px;
  aspect-ratio: ${symbols.aspectRatio.plantImage};
`;

const Placeholder = styled.View`
  width: 100%;
  border-radius: ${symbols.borderRadius.large}px;
  aspect-ratio: ${symbols.aspectRatio.plantImage};
`;
