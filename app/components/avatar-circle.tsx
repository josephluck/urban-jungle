import styled from "styled-components/native";
import {
  AvatarSize,
  avatarSizeToValue,
  avatarSizeToBordeWidth
} from "../theme";

export const AvatarCircle = styled.View<{ size: AvatarSize }>`
  width: ${props => avatarSizeToValue[props.size]};
  height: ${props => avatarSizeToValue[props.size]};
  border-radius: ${props => avatarSizeToValue[props.size]};
  border-width: ${props => avatarSizeToBordeWidth[props.size]};
  border-color: ${props => props.theme.componentColors.avatarBorder};
  background-color: ${props => props.theme.componentColors.avatarBackground};
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;
