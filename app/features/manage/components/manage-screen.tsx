import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import { FlatList, View } from "react-native";
import styled from "styled-components/native";

import { ThemeSetting } from "@urban-jungle/shared/models/profile";

import { Button } from "../../../components/button";
import {
  ContextMenuIconButton,
  ContextMenuTouchable,
  useContextMenu,
} from "../../../components/context-menu";
import { Icon } from "../../../components/icon";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { ListItem } from "../../../components/list-item";
import { Heading, TertiaryText } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { signOut } from "../../auth/store/effects";
import { shareHouseholdInvitation } from "../../households/store/effects";
import {
  selectedSelectedOrMostRecentHouseholdId,
  selectProfilesForHousehold,
} from "../../households/store/state";
import {
  disablePushNotifications,
  enablePushNotifications,
} from "../../notifications/token";
import { saveThemeSettingForProfile } from "../../profiles/store/effects";
import {
  MiniProfile,
  selectCurrentProfileThemeSetting,
  selectPushNotificationsEnabled,
} from "../../profiles/store/state";

/**
 * NB: if this errors, it's likely because you haven't run a release yet.
 * run yarn deploy:prepare to generate it
 */
const releaseDate = require("../../../release-date.json");

export const ManageScreen = () => {
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );
  const pushNotificationsEnabled = useStore(selectPushNotificationsEnabled);
  const people = useStore(
    () => selectProfilesForHousehold(selectedHouseholdId),
    [selectedHouseholdId],
  );
  const { hide: closeContextMenu } = useContextMenu();

  const handleTogglePushNotifications = useCallback(() => {
    if (pushNotificationsEnabled) {
      disablePushNotifications()();
    } else {
      enablePushNotifications()();
    }
  }, [pushNotificationsEnabled]);

  const themeSetting = useStore(selectCurrentProfileThemeSetting);

  return (
    <ScreenLayout isRootScreen>
      {selectedHouseholdId ? (
        <ScreenContainer>
          <WelcomeMessageContainer first>
            <Heading>Settings</Heading>
          </WelcomeMessageContainer>
          <View style={{ paddingHorizontal: symbols.spacing.appHorizontal }}>
            <ContextMenuTouchable
              menuId="theme"
              buttons={themeSettingOptions.map(([setting, label]) => (
                <ContextMenuIconButton
                  icon={themeSetting === setting ? "check" : undefined}
                  onPress={saveThemeSettingForProfile(setting)}
                >
                  {label}
                </ContextMenuIconButton>
              ))}
            >
              <ListItem
                title="Appearance"
                right={<Icon icon="chevron-right" />}
              />
            </ContextMenuTouchable>
            <ContextMenuTouchable
              menuId="push-notifications"
              buttons={[
                <ContextMenuIconButton
                  icon={pushNotificationsEnabled ? "check" : undefined}
                  onPress={handleTogglePushNotifications}
                >
                  Enabled
                </ContextMenuIconButton>,
                <ContextMenuIconButton
                  icon={!pushNotificationsEnabled ? "check" : undefined}
                  onPress={handleTogglePushNotifications}
                >
                  Disabled
                </ContextMenuIconButton>,
              ]}
            >
              <ListItem
                title="Push notifications"
                right={<Icon icon="chevron-right" />}
              />
            </ContextMenuTouchable>
            <ContextMenuTouchable
              menuId="sign-out"
              buttons={[
                <ContextMenuIconButton icon="log-out" onPress={signOut}>
                  Sign out
                </ContextMenuIconButton>,
                <ContextMenuIconButton onPress={closeContextMenu}>
                  Cancel
                </ContextMenuIconButton>,
              ]}
            >
              <ListItem
                title="Sign out"
                right={<Icon icon="chevron-right" />}
              />
            </ContextMenuTouchable>
          </View>
          <WelcomeMessageContainer>
            <Heading>Your network</Heading>
            <Button onPress={shareHouseholdInvitation(selectedHouseholdId)}>
              Invite
            </Button>
          </WelcomeMessageContainer>
          <ManageList
            contentContainerStyle={{
              paddingHorizontal: symbols.spacing.appHorizontal,
            }}
            data={people}
            keyExtractor={(person) => person.id}
            renderItem={({ item }) => (
              <ListItem
                image={pipe(
                  item.avatar,
                  O.getOrElse(() => ""),
                )}
                title={pipe(
                  item.name,
                  O.getOrElse(() => ""),
                )}
              />
            )}
          />
          <ReleaseDateContainer>
            <ReleaseDateText>v.{releaseDate.releaseDate}</ReleaseDateText>
          </ReleaseDateContainer>
        </ScreenContainer>
      ) : null}
    </ScreenLayout>
  );
};

const themeSettingOptions: [ThemeSetting, string][] = [
  ["light", "Light"],
  ["dark", "Dark"],
  ["system", "Device"],
];

export const manageRoute = makeNavigationRoute({
  screen: ManageScreen,
  routeName: "MANAGE_SCREEN",
});

const ScreenContainer = styled.View`
  padding-top: ${symbols.spacing.appVertical}px;
  flex: 1;
`;

const ManageList = styled(FlatList as new () => FlatList<MiniProfile>)`
  flex: 1;
`;

const ReleaseDateContainer = styled.View`
  justify-content: center;
  align-items: center;
  margin-vertical: ${symbols.spacing._16};
`;

const ReleaseDateText = styled(TertiaryText)`
  color: ${symbols.colors.lightOffGray};
  font-size: ${symbols.font._8.size};
`;

const WelcomeMessageContainer = styled.View<{ first?: boolean }>`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  margin-top: ${(props) => (props.first ? 0 : symbols.spacing._16)}px;
  margin-bottom: ${symbols.spacing._20}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
