import * as O from "fp-ts/lib/Option";
import styled from "styled-components/native";
import { pipe } from "fp-ts/lib/pipeable";
import { AvatarCircle } from "./avatar-circle";

export const Avatar = ({
  src,
  letter
}: {
  src: O.Option<string>;
  letter: O.Option<string>;
}) =>
  pipe(
    src,
    O.fold(
      () => (
        <AvatarPlaceholder
          letter={pipe(
            letter,
            O.getOrElse(() => "👋")
          )}
        />
      ),
      uri => (
        <AvatarCircle>
          <AvatarImage source={{ uri }} />
        </AvatarCircle>
      )
    )
  );

export const AvatarPlaceholder = ({ letter }: { letter: string }) => (
  <AvatarCircle>
    <PlaceholderLetter>{letter}</PlaceholderLetter>
  </AvatarCircle>
);

const AvatarImage = styled.Image`
  width: ${props => props.theme.size.avatarImage}px;
  height: ${props => props.theme.size.avatarImage}px;
  border-radius: ${props => props.theme.size.avatarImage / 2}px;
`;

const PlaceholderLetter = styled.View`
  width: ${props => props.theme.size.avatarImage}px;
  height: ${props => props.theme.size.avatarImage}px;
  border-radius: ${props => props.theme.size.avatarImage / 2}px;
  justify-content: center;
  align-items: center;
  font-size: ${props => props.theme.font._24.size};
  color: ${props => props.theme.componentColors.avatarPlaceholderLetter};
`;
