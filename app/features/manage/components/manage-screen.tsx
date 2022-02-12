import { StackScreenProps } from "@react-navigation/stack";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback } from "react";
import { FlatList, View } from "react-native";
import styled from "styled-components/native";
import { Icon } from "../../../components/icon";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { ListItem } from "../../../components/list-item";
import { TouchableIcon } from "../../../components/touchable-icon";
import { TouchableOpacity } from "../../../components/touchable-opacity";
import { Heading, TertiaryText } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { MANAGE_STACK_NAME } from "../../../navigation/stack-names";
import { shareHouseholdInvitation } from "../../../store/effects";
import {
  MiniProfile,
  selectAuthProviderEmail,
  selectAuthProviderPhone,
  selectCurrentUserId,
  selectedSelectedOrMostRecentHouseholdId,
  selectManageAuthInitialContext,
  selectProfilesForHousehold,
} from "../../../store/selectors";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { useManageAuthMachine } from "../machine/machine";
import { ManageAuthFlow } from "../machine/types";
import { routeNames } from "../route-names";
import { manageAppearanceRoute } from "./manage-appearance";
import { manageLogoutRoute } from "./manage-logout";
import { manageNotificationsRoute } from "./manage-notifications";
import { manageProfileRoute } from "./manage-profile";

/**
 * NB: if this errors, it's likely because you haven't run a release yet.
 * run yarn deploy:prepare to generate it
 */
const pjson = require("../../../package.json");

export const ManageScreen = ({ navigation }: StackScreenProps<{}>) => {
  const { execute } = useManageAuthMachine();
  const _currentProfileId = useStore(selectCurrentUserId);
  const currentProfileId = pipe(
    _currentProfileId,
    O.getOrElse(() => ""),
  );

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );

  const people = useStore(
    () => selectProfilesForHousehold(selectedHouseholdId),
    [selectedHouseholdId],
  );

  const authProviderPhone = useStore(selectAuthProviderPhone);

  const authProviderEmail = useStore(selectAuthProviderEmail);

  const initialManageAuthContext = useStore(selectManageAuthInitialContext);

  const handleEditProfile = useCallback(
    () =>
      manageProfileRoute.navigateTo(navigation, {
        profileId: currentProfileId,
      }),
    [navigation, currentProfileId],
  );

  const makeManageAuthExecuteHandler = (flow: ManageAuthFlow) => () =>
    execute((ctx) => {
      ctx.flow = flow;
      ctx.recentlyAuthenticated = false;
      ctx.currentPhoneNumber = initialManageAuthContext.currentPhoneNumber;
      ctx.newPhoneNumber = undefined;
      ctx.currentEmailAddress = initialManageAuthContext.currentEmailAddress;
      ctx.newEmailAddress = undefined;
      ctx.currentPassword = undefined;
      ctx.newPassword = undefined;
      ctx.verificationId = undefined;
      ctx.verificationCode = undefined;
      ctx.currentAuthProviders =
        initialManageAuthContext.currentAuthProviders || [];
      ctx.selectedAuthSecurityCheckProvider = undefined;
    });

  return (
    <ScreenLayout isRootScreen>
      {selectedHouseholdId ? (
        <ScreenContainer>
          <WelcomeMessageContainer>
            <Heading>Settings</Heading>
          </WelcomeMessageContainer>
          <View style={{ paddingHorizontal: symbols.spacing.appHorizontal }}>
            <TouchableOpacity
              onPress={() => manageAppearanceRoute.navigateTo(navigation, {})}
            >
              <ListItem
                title="Appearance"
                right={<Icon icon="chevron-right" />}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                manageNotificationsRoute.navigateTo(navigation, {})
              }
            >
              <ListItem
                title="Push notifications"
                right={<Icon icon="chevron-right" />}
              />
            </TouchableOpacity>
          </View>
          <WelcomeMessageContainer>
            <Heading>Security</Heading>
          </WelcomeMessageContainer>
          <View style={{ paddingHorizontal: symbols.spacing.appHorizontal }}>
            {pipe(
              authProviderEmail,
              O.fold(
                () => (
                  <TouchableOpacity
                    onPress={makeManageAuthExecuteHandler("ADD_EMAIL_AUTH")}
                  >
                    <ListItem
                      title="Add password"
                      right={<Icon icon="chevron-right" />}
                    />
                  </TouchableOpacity>
                ),
                () => (
                  <>
                    <TouchableOpacity
                      onPress={makeManageAuthExecuteHandler("CHANGE_EMAIL")}
                    >
                      <ListItem
                        title="Change email"
                        right={<Icon icon="chevron-right" />}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={makeManageAuthExecuteHandler("CHANGE_PASSWORD")}
                    >
                      <ListItem
                        title="Change password"
                        right={<Icon icon="chevron-right" />}
                      />
                    </TouchableOpacity>
                  </>
                ),
              ),
            )}
            {pipe(
              authProviderPhone,
              O.fold(
                () => (
                  <TouchableOpacity
                    onPress={makeManageAuthExecuteHandler("ADD_PHONE_AUTH")}
                  >
                    <ListItem
                      title="Add phone number"
                      right={<Icon icon="chevron-right" />}
                    />
                  </TouchableOpacity>
                ),
                () => (
                  <TouchableOpacity
                    onPress={makeManageAuthExecuteHandler("CHANGE_PHONE")}
                  >
                    <ListItem
                      title="Change phone number"
                      right={<Icon icon="chevron-right" />}
                    />
                  </TouchableOpacity>
                ),
              ),
            )}
            <TouchableOpacity
              onPress={() => manageLogoutRoute.navigateTo(navigation, {})}
            >
              <ListItem title="Logout" right={<Icon icon="chevron-right" />} />
            </TouchableOpacity>
          </View>
          <WelcomeMessageContainer>
            <Heading>Your network</Heading>
            <TouchableIcon
              icon="plus"
              onPress={shareHouseholdInvitation(selectedHouseholdId)}
            />
          </WelcomeMessageContainer>
          <ManageList
            contentContainerStyle={{
              paddingHorizontal: symbols.spacing.appHorizontal,
            }}
            data={people}
            keyExtractor={(person) => person.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={handleEditProfile}
                disabled={!item.isCurrentProfile}
              >
                <ListItem
                  image={pipe(item.avatar, O.toUndefined)}
                  title={pipe(
                    item.name,
                    O.getOrElse(() => ""),
                  )}
                  right={item.isCurrentProfile ? <Icon icon="edit-3" /> : null}
                />
              </TouchableOpacity>
            )}
          />
          <ReleaseDateContainer>
            <ReleaseDateText>v.{pjson.version}</ReleaseDateText>
          </ReleaseDateContainer>
        </ScreenContainer>
      ) : null}
    </ScreenLayout>
  );
};

export const manageRoute = makeNavigationRoute({
  screen: ManageScreen,
  stackName: MANAGE_STACK_NAME,
  routeName: routeNames.manageRoute,
});

const ScreenContainer = styled.ScrollView`
  flex: 1;
`;

const ManageList = styled(FlatList as new () => FlatList<MiniProfile>)`
  flex: 1;
`;

const ReleaseDateContainer = styled.View`
  justify-content: center;
  align-items: center;
  margin-vertical: ${symbols.spacing._16}px;
`;

const ReleaseDateText = styled(TertiaryText)`
  color: ${symbols.colors.lightOffGray};
  font-size: ${symbols.font._8.size}px;
`;

const WelcomeMessageContainer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  margin-top: ${symbols.spacing._20}px;
  margin-bottom: ${symbols.spacing._20}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
