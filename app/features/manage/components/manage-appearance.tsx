import { useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { ThemeSetting } from "@urban-jungle/shared/models/profile";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { Icon } from "../../../components/icon";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { ListItem } from "../../../components/list-item";
import { TouchableOpacity } from "../../../components/touchable-opacity";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { saveThemeSettingForProfile } from "../../profiles/store/effects";
import { selectCurrentProfileThemeSetting } from "../../profiles/store/state";

export const ManageAppearanceScreen = ({}: StackScreenProps<
  Record<keyof ManageAppearanceRouteParams, undefined>
>) => {
  const navigation = useNavigation();
  const runWithUIState = useRunWithUIState();
  const themeSetting = useStore(selectCurrentProfileThemeSetting);
  const handleSave = useCallback((setting: ThemeSetting) => {
    runWithUIState(
      pipe(
        saveThemeSettingForProfile(setting),
        TE.map(() => navigation.goBack()),
      ),
    );
  }, []);
  return (
    <ScreenLayout isModal>
      {themeSettingOptions.map(([setting, label]) => (
        <TouchableOpacity
          onPress={() => handleSave(setting)}
          key={label}
          style={{ paddingHorizontal: symbols.spacing.appHorizontal }}
        >
          <ListItem
            right={themeSetting === setting ? <Icon icon="check" /> : undefined}
            title={label}
          />
        </TouchableOpacity>
      ))}
    </ScreenLayout>
  );
};

type ManageAppearanceRouteParams = {};

export const manageAppearanceRoute = makeNavigationRoute<ManageAppearanceRouteParams>(
  {
    screen: ManageAppearanceScreen,
    stackName: null,
    routeName: "MANAGE_APPEARANCE_SCREEN",
  },
);

const themeSettingOptions: [ThemeSetting, string][] = [
  ["light", "Light"],
  ["dark", "Dark"],
];
