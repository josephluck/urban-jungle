import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";

// TODO: support uri?: ImageModel | string to avoid messing about at the call site
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
