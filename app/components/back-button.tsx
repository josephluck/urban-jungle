import React from "react";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { symbols } from "../theme";
import { StyleProp } from "react-native";
import { ViewStyle } from "react-native";

export const BackButton = ({
  size = symbols.font._28.size,
  onPress,
  style,
}: {
  size?: number;
  onPress: () => void;
  style: StyleProp<ViewStyle>;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[{ width: size, height: size }, style]}
    >
      <Feather name="arrow-left" size={size} />
    </TouchableOpacity>
  );
};
