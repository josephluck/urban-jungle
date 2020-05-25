import React from "react";
import { Image, StyleProp, ViewStyle } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { Icon } from "./icon";

export const CircleImage = ({
  style,
  uri,
  size = 66,
  ticked = false,
}: {
  style?: StyleProp<ViewStyle>;
  uri: string;
  size?: number;
  ticked?: boolean;
}) => {
  const badgeOffset = 12 - badgeSize / 2;
  return (
    <Circle style={[style, { width: size, height: size, borderRadius: size }]}>
      <Image
        width={size}
        style={{ aspectRatio: 1, borderRadius: size }}
        source={{ uri }}
      />
      {ticked ? (
        <BadgeWrapper style={{ top: badgeOffset, right: badgeOffset }}>
          <Icon
            icon="check"
            color={symbols.colors.pureWhite}
            size={badgeIconSize}
          />
        </BadgeWrapper>
      ) : null}
    </Circle>
  );
};

const badgeIconSize = 16;
const badgeSize = badgeIconSize + symbols.spacing._4 * 2;

const Circle = styled.View`
  background-color: ${symbols.colors.nearWhite};
`;

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
