import React from "react";
import { Feather } from "@expo/vector-icons";
import { symbols } from "../theme";

export const Icon = ({
  icon,
  size = 28,
  color = symbols.colors.nearBlack,
}: {
  icon: string;
  size?: number;
  color?: string;
}) => <Feather name={icon} size={size} color={color} />;
