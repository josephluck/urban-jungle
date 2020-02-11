import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUserPlus } from "@fortawesome/pro-solid-svg-icons";
import styled from "styled-components/native";
import { AvatarCircle } from "./avatar-circle";
import { symbols, useTheme } from "../theme";

export const AvatarButton = ({
  onPress,
  disabled
}: {
  onPress: () => void;
  disabled?: boolean;
}) => {
  const theme = useTheme();
  return (
    <ButtonWrapper onPress={onPress} disabled={disabled}>
      <AvatarCircle size="default">
        <FontAwesomeIcon
          icon={faUserPlus}
          size={symbols.font._20.size}
          color={theme.avatarPlaceholderLetter}
        ></FontAwesomeIcon>
      </AvatarCircle>
    </ButtonWrapper>
  );
};

const ButtonWrapper = styled.TouchableOpacity``;
