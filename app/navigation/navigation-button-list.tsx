import { useNavigation } from "@react-navigation/native";
import React, { useLayoutEffect } from "react";
import { View } from "react-native";
import { symbols } from "../theme";
import { CloseButton } from "./close-button";

export const NavigationButtonList: React.FC<{
  children: React.ReactNode | React.ReactNode[];
  withoutClose?: boolean;
}> = ({ children, withoutClose }) => {
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
            <View key={index} style={{ marginLeft: symbols.spacing._16 }}>
              {child}
            </View>
          ))}
          {withoutClose ? null : (
            <View style={{ marginLeft: symbols.spacing._16 }}>
              <CloseButton />
            </View>
          )}
        </View>
      ),
    });
  }, [navigation]);
  return null;
};
