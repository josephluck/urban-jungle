import { useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { Icon } from "@urban-jungle/design/components/icon";
import { ScreenLayout } from "@urban-jungle/design/components/layouts/screen-layout";
import { ListItem } from "@urban-jungle/design/components/list-item";
import { TouchableOpacity } from "@urban-jungle/design/components/touchable-opacity";
import { symbols } from "@urban-jungle/design/theme";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { selectPushNotificationsEnabled } from "../../../store/selectors";
import { useStore } from "../../../store/state";
import { useRunWithUIState } from "../../../store/ui";
import {
  disablePushNotifications,
  enablePushNotifications,
} from "../../notifications/token";

export const ManageNotificationsScreen = ({}: StackScreenProps<
  Record<keyof ManageNotificationsRouteParams, undefined>
>) => {
  const navigation = useNavigation();
  const runWithUIState = useRunWithUIState();
  const pushNotificationsEnabled = useStore(selectPushNotificationsEnabled);
  const handleTogglePushNotifications = useCallback(() => {
    runWithUIState(
      pipe(
        pushNotificationsEnabled
          ? disablePushNotifications()
          : enablePushNotifications(),
        TE.map(() => navigation.goBack()),
      ),
    );
  }, [pushNotificationsEnabled]);
  return (
    <ScreenLayout isModal>
      <TouchableOpacity
        onPress={handleTogglePushNotifications}
        style={{ paddingHorizontal: symbols.spacing.appHorizontal }}
      >
        <ListItem
          right={pushNotificationsEnabled ? <Icon icon="check" /> : undefined}
          title="Enabled"
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleTogglePushNotifications}
        style={{ paddingHorizontal: symbols.spacing.appHorizontal }}
      >
        <ListItem
          right={!pushNotificationsEnabled ? <Icon icon="check" /> : undefined}
          title="Disabled"
        />
      </TouchableOpacity>
    </ScreenLayout>
  );
};

type ManageNotificationsRouteParams = {};

export const manageNotificationsRoute =
  makeNavigationRoute<ManageNotificationsRouteParams>({
    screen: ManageNotificationsScreen,
    stackName: null,
    routeName: "MANAGE_NOTIFICATIONS_SCREEN",
  });
