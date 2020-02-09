import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus } from "@fortawesome/pro-light-svg-icons";
import styled from "styled-components/native";
import { AvatarCircle } from "./avatar-circle";

export const AvatarButton = ({ onPress }: { onPress: () => void }) => (
  <ButtonWrapper onPress={onPress}>
    <AvatarCircle>
      <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
    </AvatarCircle>
  </ButtonWrapper>
);

const ButtonWrapper = styled.TouchableOpacity``;
