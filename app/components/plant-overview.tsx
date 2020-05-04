import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { SubHeading } from "./typography";
import { Label } from "./label";
import { View } from "react-native";

export const PlantOverview = ({
  name,
  location,
  avatar,
}: {
  name: string;
  location?: string;
  avatar?: string;
}) => (
  <View>
    <PlantNameWrapper>
      <SubHeading>{name}</SubHeading>
      {location ? <LocationLabel>{location}</LocationLabel> : null}
    </PlantNameWrapper>
    {avatar ? (
      <PlantImage source={{ uri: avatar }} />
    ) : (
      <PlantImagePlaceholder />
    )}
  </View>
);

const LocationLabel = styled(Label)`
  margin-left: ${symbols.spacing._8}px;
`;

const PlantImage = styled.Image`
  border-radius: ${symbols.borderRadius.large}px;
  width: 100%;
  aspect-ratio: 2;
`;

const PlantImagePlaceholder = styled.View`
  background-color: ${symbols.colors.nearWhite};
  border-radius: ${symbols.borderRadius.large}px;
  width: 100%;
  aspect-ratio: 2;
`;

const PlantNameWrapper = styled.View`
  padding-bottom: ${symbols.spacing._20}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
