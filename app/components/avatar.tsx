import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";
import styled from "styled-components/native";

import { AvatarSize, avatarSizeToValue, symbols } from "../theme";
import { AvatarCircle } from "./avatar-circle";

export const Avatar = ({
  src,
  letter,
  size = "default",
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
            O.getOrElse(() => "👋"),
          )}
        />
      ),
      (uri) => (
        <AvatarCircle size={size}>
          <AvatarImage size={size} source={{ uri }} />
        </AvatarCircle>
      ),
    ),
  );

export const AvatarPlaceholder = ({
  letter,
  size,
}: {
  letter: string;
  size: AvatarSize;
}) => (
  <AvatarCircle size={size}>
    <PlaceholderLetter size={size}>{letter}</PlaceholderLetter>
  </AvatarCircle>
);

const AvatarImage = styled.Image<{ size: AvatarSize }>`
  width: ${(props) => avatarSizeToValue[props.size]};
  height: ${(props) => avatarSizeToValue[props.size]};
  border-radius: ${(props) => avatarSizeToValue[props.size] / 2};
`;

const PlaceholderLetter = styled.Text<{ size: AvatarSize }>`
  font-size: ${symbols.font._28.size}px;
  color: ${(props) => props.theme.avatarPlaceholderLetter};
`;
