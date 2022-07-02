import { StackActions, useNavigation } from "@react-navigation/native";
import { TouchableIcon } from "@urban-jungle/design/components/touchable-icon";
import { useCallback } from "react";

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
