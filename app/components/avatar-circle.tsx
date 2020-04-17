import styled from "styled-components/native";
import {
  AvatarSize,
  avatarSizeToValue,
  avatarSizeToBorderWidth,
} from "../theme";

export const AvatarCircle = styled.View<{ size: AvatarSize }>`
  width: ${(props) => avatarSizeToValue[props.size]};
  height: ${(props) => avatarSizeToValue[props.size]};
  border-radius: ${(props) => avatarSizeToValue[props.size]};
  border-width: ${(props) => avatarSizeToBorderWidth[props.size]};
  border-color: ${(props) => props.theme.avatarBorder};
  background-color: ${(props) => props.theme.avatarBackground};
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;
