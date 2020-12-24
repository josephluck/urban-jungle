import React from "react";
import { Image, StyleProp, TouchableOpacity, ViewStyle } from "react-native";
import styled from "styled-components/native";

import { symbols } from "../theme";
import { Icon } from "./icon";

export const CircleImage = ({
  style,
  uri,
  size = 66,
  withTickBadge,
  onPress,
  withDeleteBadge,
}: {
  style?: StyleProp<ViewStyle>;
  uri: string;
  size?: number;
  withTickBadge?: boolean;
  withDeleteBadge?: boolean;
  onPress?: () => void;
}) => {
  const badgeOffset = 12 - badgeSize / 2;
  return (
    <CircleButton
      disabled={typeof onPress === "undefined"}
      onPress={onPress}
      size={size}
      style={style}
    >
      <Image
        width={size}
        style={{ width: size, aspectRatio: 1, borderRadius: size / 2 }}
        source={{ uri }}
      />
      {withTickBadge || withDeleteBadge ? (
        <BadgeWrapper
          style={{
            top: badgeOffset,
            right: badgeOffset,
            backgroundColor: withTickBadge
              ? symbols.colors.darkGreen
              : symbols.colors.darkRed,
          }}
        >
          <Icon
            icon={withTickBadge ? "check" : "trash-2"}
            color={symbols.colors.pureWhite}
            size={badgeIconSize}
          />
        </BadgeWrapper>
      ) : null}
    </CircleButton>
  );
};

export const CircleContainer = ({
  size,
  children,
  style,
}: {
  size: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => (
  <Circle style={[style, { width: size, height: size, borderRadius: size }]}>
    {children}
  </Circle>
);

export const CircleButton = ({
  size,
  children,
  style,
  onPress,
  disabled,
}: {
  size: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
}) => (
  <CircleContainerButton
    style={[style, { width: size, height: size }]}
    onPress={onPress}
    disabled={disabled}
  >
    <CircleContainer size={size}>{children}</CircleContainer>
  </CircleContainerButton>
);

const badgeIconSize = 16;
const badgeSize = badgeIconSize + symbols.spacing._4 * 2;

const Circle = styled.View`
  background-color: ${(props) => props.theme.avatarBackground};
  align-items: center;
  justify-content: center;
`;

const CircleContainerButton = styled(TouchableOpacity)``;

const BadgeWrapper = styled.View`
  position: absolute;
  background-color: ${symbols.colors.darkGreen};
  border-radius: 999;
  width: ${badgeSize + 4}px;
  height: ${badgeSize + 4}px;
  justify-content: center;
  align-items: center;
  border-color: ${symbols.colors.pureWhite};
  border-width: 2;
`;
