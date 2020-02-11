import styled from "styled-components/native";
import { AvatarSize, sizeToDimension } from "../theme";

export const AvatarCircle = styled.View<{ size: AvatarSize }>`
  width: ${props => sizeToDimension[props.size]};
  height: ${props => sizeToDimension[props.size]};
  border-radius: ${props => sizeToDimension[props.size]};
  border-width: 3px;
  border-color: ${props => props.theme.componentColors.avatarBorder};
  background-color: ${props => props.theme.componentColors.avatarBackground};
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;
