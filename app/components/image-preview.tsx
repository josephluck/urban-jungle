import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { Icon } from "./icon";

export const ImagePreview = ({
  uri,
  onPress,
  aspectRatio,
}: {
  uri: string;
  onPress: () => void;
  aspectRatio: number;
}) => (
  <TakenPictureContainer>
    <TakenPicture source={{ uri }} style={{ aspectRatio }} />
    <RetryButton onPress={onPress}>
      <Icon icon="x" size={20} />
    </RetryButton>
  </TakenPictureContainer>
);

const TakenPictureContainer = styled.View``;

const TakenPicture = styled.Image`
  width: 100%;
`;

const RetryButton = styled.TouchableOpacity`
  position: absolute;
  top: ${symbols.spacing._6}px;
  right: ${symbols.spacing._6}px;
  background-color: ${symbols.colors.pureWhite};
  padding-horizontal: ${symbols.spacing._6}px;
  padding-vertical: ${symbols.spacing._6}px;
  border-radius: 100px;
  flex-grow: 0;
`;
