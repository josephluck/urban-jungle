import styled from "styled-components/native";

export const AvatarCircle = styled.View`
  width: ${props => props.theme.size.avatarImage}px;
  height: ${props => props.theme.size.avatarImage}px;
  border-radius: ${props => props.theme.size.avatarImage / 2}px;
  border-width: 3px;
  border-color: ${props => props.theme.componentColors.avatarBorder};
  background-color: ${props => props.theme.componentColors.avatarBackground};
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;
