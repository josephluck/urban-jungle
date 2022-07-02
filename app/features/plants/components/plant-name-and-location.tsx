import { Label } from "@urban-jungle/design/components/label";
import { SubHeading } from "@urban-jungle/design/components/typography";
import { symbols } from "@urban-jungle/design/theme";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import styled from "styled-components/native";

export const PlantNameAndLocation = ({
  name,
  location,
  style,
}: {
  name: string;
  location?: string;
  style?: StyleProp<ViewStyle>;
}) => (
  <PlantNameWrapper style={style}>
    <SubHeading>{name}</SubHeading>
    {location ? <LocationLabel>{location}</LocationLabel> : null}
  </PlantNameWrapper>
);

const PlantNameWrapper = styled.View`
  padding-bottom: ${symbols.spacing._20}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LocationLabel = styled(Label)`
  margin-left: ${symbols.spacing._8}px;
`;
