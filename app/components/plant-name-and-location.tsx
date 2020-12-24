import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import styled from "styled-components/native";

import { symbols } from "../theme";
import { Label } from "./label";
import { SubHeading } from "./typography";

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
