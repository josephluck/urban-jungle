import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { ListItem } from "../../../components/list-item";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { Heading } from "../../../components/typography";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { shareHouseholdInvitation } from "../../households/store/effects";
import {
  selectedSelectedOrMostRecentHouseholdId,
  selectProfilesForHousehold,
} from "../../households/store/state";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { Switch } from "react-native";
import {
  enablePushNotifications,
  disablePushNotifications,
} from "../../notifications/token";
import { selectPushNotificationsEnabled } from "../../profiles/store/state";

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
          >
            {people.map((person) => (
              <ListItem
                key={person.id}
                image={pipe(
                  person.avatar,
                  O.getOrElse(() => "")
                )}
                title={pipe(
                  person.name,
                  O.getOrElse(() => "")
                )}
              />
            ))}
          </ManageList>
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

const ManageList = styled.ScrollView`
  flex: 1;
  background-color: ${symbols.colors.appBackground};
`;

const WelcomeMessageContainer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  margin-bottom: ${symbols.spacing.appHorizontal * 2}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
