import { useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { ListItem } from "../../../components/list-item";
import { TouchableOpacity } from "../../../components/touchable-opacity";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { symbols } from "../../../theme";
import { signOut } from "../../auth/store/effects";

export const ManageLogoutScreen = ({}: StackScreenProps<
  Record<keyof ManageLogoutRouteParams, undefined>
>) => {
  const navigation = useNavigation();
  return (
    <ScreenLayout isModal>
      <TouchableOpacity
        onPress={signOut}
        style={{ paddingHorizontal: symbols.spacing.appHorizontal }}
      >
        <ListItem title="Logout" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={navigation.goBack}
        style={{ paddingHorizontal: symbols.spacing.appHorizontal }}
      >
        <ListItem title="Cancel" />
      </TouchableOpacity>
    </ScreenLayout>
  );
};

type ManageLogoutRouteParams = {};

export const manageLogoutRoute = makeNavigationRoute<ManageLogoutRouteParams>({
  screen: ManageLogoutScreen,
  stackName: null,
  routeName: "MANAGE_LOGOUT_SCREEN",
});
