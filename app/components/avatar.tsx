import * as O from "fp-ts/lib/Option";
import styled from "styled-components/native";
import { pipe } from "fp-ts/lib/pipeable";

export const Avatar = ({
  src,
  letter
}: {
  src: O.Option<string>;
  letter: O.Option<string>;
}) => (
  <Wrapper>
    {pipe(
      src,
      O.fold(
        () => (
          <PlaceholderLetter>
            {pipe(
              letter,
              O.getOrElse(() => "👋")
            )}
          </PlaceholderLetter>
        ),
        uri => <AvatarImage source={{ uri: uri }} />
      )
    )}
  </Wrapper>
);

const Wrapper = styled.View`
  width: ${props => props.theme.size.avatarImage}px;
  height: ${props => props.theme.size.avatarImage}px;
  border-radius: ${props => props.theme.size.avatarImage / 2}px;
  border-width: 3px;
  border-color: ${props => props.theme.componentColors.avatarBorder};
  background-color: ${props => props.theme.componentColors.avatarBackground};
  overflow: hidden;
`;

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
