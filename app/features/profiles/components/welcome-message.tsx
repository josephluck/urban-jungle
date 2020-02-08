import * as O from "fp-ts/lib/Option";
import {
  selectCurrentProfileAvatar,
  selectCurrentProfileName
} from "../../profiles/store/state";
import { Heading } from "../../../components/typography";
import styled from "styled-components/native";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useMemo } from "react";
import { useStore } from "../../../store/state";

export const WelcomeMessage = () => {
  const profileAvatar_ = useStore(selectCurrentProfileAvatar);
  const profileAvatar = O.getOrElse(
    () =>
      "https://medgoldresources.com/wp-content/uploads/2018/02/avatar-placeholder.gif"
  )(profileAvatar_);
  const profileName_ = useStore(selectCurrentProfileName);
  const avatarSource = useMemo(() => ({ uri: profileAvatar }), [profileAvatar]);

  return (
    <Wrapper>
      <AvatarImageWrapper>
        <AvatarImage source={avatarSource} />
      </AvatarImageWrapper>
      {pipe(
        profileName_,
        O.fold(
          () => null,
          name => <Heading>👋 Hey, {name}</Heading>
        )
      )}
    </Wrapper>
  );
};

const Wrapper = styled.View`
  align-items: center;
  justify-content: center;
`;

const AvatarImageWrapper = styled.View`
  height: ${props => props.theme.size.welcomeAvatarImage}px;
  width: ${props => props.theme.size.welcomeAvatarImage}px;
  margin-bottom: ${props => props.theme.spacing._10}px;
  border-radius: ${props => props.theme.size.welcomeAvatarImage}px;
  overflow: hidden;
`;

const AvatarImage = styled.Image`
  height: ${props => props.theme.size.welcomeAvatarImage}px;
  width: ${props => props.theme.size.welcomeAvatarImage}px;
`;
