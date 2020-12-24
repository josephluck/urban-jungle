import React from "react";
import { SwitchProps } from "react-native";
import { Switch as RNSwitch } from "react-native";
import { useTheme } from "styled-components";

export const Switch = (props: SwitchProps) => {
  const theme = useTheme();
  return (
    <RNSwitch
      thumbColor={theme.switchThumb}
      trackColor={{
        true: theme.switchBackgroundTrue,
        false: theme.switchBackgroundFalse,
      }}
      ios_backgroundColor={theme.switchBackgroundFalse}
      {...props}
    />
  );
};
