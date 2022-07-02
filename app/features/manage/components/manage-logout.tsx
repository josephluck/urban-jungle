import { useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { ScreenLayout } from "@urban-jungle/design/components/layouts/screen-layout";
import { ListItem } from "@urban-jungle/design/components/list-item";
import { TouchableOpacity } from "@urban-jungle/design/components/touchable-opacity";
import { symbols } from "@urban-jungle/design/theme";
import React from "react";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { signOut } from "../../../store/effects";

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
