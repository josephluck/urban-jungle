import { StackActions, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { TouchableIcon } from "../components/touchable-icon";

export const CloseButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableIcon
      onPress={useCallback(
        () => navigation.dispatch(StackActions.popToTop()),
        [],
      )}
      icon="x"
    />
  );
};

export const CloseBackButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableIcon
      onPress={useCallback(() => navigation.dispatch(StackActions.pop()), [])}
      icon="x"
    />
  );
};
