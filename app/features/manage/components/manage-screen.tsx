import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import { FlatList, Switch } from "react-native";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { ListItem } from "../../../components/list-item";
import { Heading, TertiaryText } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { shareHouseholdInvitation } from "../../households/store/effects";
import {
  selectedSelectedOrMostRecentHouseholdId,
  selectProfilesForHousehold,
} from "../../households/store/state";
import {
  disablePushNotifications,
  enablePushNotifications,
} from "../../notifications/token";
import {
  MiniProfile,
  selectPushNotificationsEnabled,
} from "../../profiles/store/state";

/**
 * NB: if this errors, it's likely because you haven't run a release yet.
 * run yarn deploy:prepare to generate it
 */
const releaseDate = require("../../../release-date.json");

export const ManageScreen = () => {
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );
  const pushNotificationsEnabled = useStore(selectPushNotificationsEnabled);
  const people = useStore(
    () => selectProfilesForHousehold(selectedHouseholdId),
    [selectedHouseholdId]
  );

  const handleTogglePushNotifications = useCallback(() => {
    if (pushNotificationsEnabled) {
      disablePushNotifications()();
    } else {
      enablePushNotifications()();
    }
  }, [pushNotificationsEnabled]);

  return (
    <ScreenLayout>
      {selectedHouseholdId ? (
        <ScreenContainer>
          <WelcomeMessageContainer>
            <Switch
              value={pushNotificationsEnabled}
              onValueChange={handleTogglePushNotifications}
            />
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
                  O.getOrElse(() => "")
                )}
                title={pipe(
                  item.name,
                  O.getOrElse(() => "")
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

export const manageRoute = makeNavigationRoute({
  screen: ManageScreen,
  routeName: "MANAGE_SCREEN",
  authenticated: true,
});

const ScreenContainer = styled.View`
  padding-top: ${symbols.spacing.appVertical}px;
  flex: 1;
  background-color: ${symbols.colors.appBackground};
`;

const ManageList = styled(FlatList as new () => FlatList<MiniProfile>)`
  flex: 1;
  background-color: ${symbols.colors.appBackground};
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

const WelcomeMessageContainer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  margin-bottom: ${symbols.spacing.appHorizontal * 2}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
