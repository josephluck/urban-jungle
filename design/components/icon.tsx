import { Feather } from "@expo/vector-icons";
import React, { ComponentProps } from "react";
import { useTheme } from "styled-components";

export const Icon = ({
  icon,
  size = 28,
  color,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  size?: number;
  color?: string;
}) => {
  const theme = useTheme();
  const _color = color || theme.defaultTextColor;
  return <Feather name={icon} size={size} color={_color} />;
};
