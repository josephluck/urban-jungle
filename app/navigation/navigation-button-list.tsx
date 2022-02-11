import { useNavigation } from "@react-navigation/native";
import React, { useLayoutEffect } from "react";
import { View } from "react-native";
import { symbols } from "../theme";
import { CloseButton } from "./close-button";

export const NavigationButtonList: React.FC<{
  children: React.ReactNode | React.ReactNode[];
}> = ({ children }) => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View
          style={{
            flexDirection: "row",
          }}
        >
          {React.Children.map(children, (child, index) => (
            <View key={index} style={{ marginRight: symbols.spacing._16 }}>
              {child}
            </View>
          ))}
          <CloseButton />
        </View>
      ),
    });
  }, [navigation]);
  return null;
};
