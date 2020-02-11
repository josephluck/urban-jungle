import React from "react";
import * as O from "fp-ts/lib/Option";
import styled from "styled-components/native";
import { pipe } from "fp-ts/lib/pipeable";
import { AvatarCircle } from "./avatar-circle";
import { AvatarSize, avatarSizeToValue } from "../theme";

export const Avatar = ({
  src,
  letter,
  size = "default"
}: {
  src: O.Option<string>;
  letter: O.Option<string>;
  size?: AvatarSize;
}) =>
  pipe(
    src,
    O.fold(
      () => (
        <AvatarPlaceholder
          size={size}
          letter={pipe(
            letter,
            O.getOrElse(() => "👋")
          )}
        />
      ),
      uri => (
        <AvatarCircle size={size}>
          <AvatarImage size={size} source={{ uri }} />
        </AvatarCircle>
      )
    )
  );

export const AvatarPlaceholder = ({
  letter,
  size
}: {
  letter: string;
  size: AvatarSize;
}) => (
  <AvatarCircle size={size}>
    <PlaceholderLetter size={size}>{letter}</PlaceholderLetter>
  </AvatarCircle>
);

const AvatarImage = styled.Image<{ size: AvatarSize }>`
  width: ${props => avatarSizeToValue[props.size]};
  height: ${props => avatarSizeToValue[props.size]};
  border-radius: ${props => avatarSizeToValue[props.size] / 2};
`;

const PlaceholderLetter = styled.Text<{ size: AvatarSize }>`
  font-size: ${props => props.theme.font._24.size}px;
  color: ${props => props.theme.componentColors.avatarPlaceholderLetter};
`;
