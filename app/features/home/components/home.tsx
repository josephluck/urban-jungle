import React, { useCallback, useContext } from "react";
import { Heading, SubHeading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/screen-layout";
import {
  useAuthStore,
  selectHasAuthenticated,
  selectCurrentProfileId,
  selectProfiles
} from "../../auth/store/state";
import { signOut } from "../../auth/store/effects";
import { Button, View, ScrollView } from "react-native";
import { NavigationContext } from "react-navigation";
import {
  createLoginRoute,
  createSignUpRoute
} from "../../auth/navigation/routes";
import {
  useHouseholdsStore,
  selectSelectedHousehold
} from "../../households/store/state";
import { createHouseholdForCurrentProfile } from "../../households/store/effects";
import { WelcomeMessage } from "../../profile/components/welcome-message";
import styled from "styled-components/native";
import { createPlantForHousehold } from "../../plants/store/effects";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { PlantModel } from "../../../types";
import { IErr } from "../../../utils/err";

export const Home = () => {
  const hasAuthenticated = useAuthStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <HomeScreen />;
  }

  return <SplashScreen />;
};

const HomeScreen = () => {
  return (
    <ScreenLayout>
      <ScrollView>
        <WelcomeWrapper>
          <WelcomeMessage />
        </WelcomeWrapper>
        <HouseholdsList />
        <SelectedHousehold />
        <ProfilesList />
        <Heading style={{ marginTop: 50 }}>Auth actions</Heading>
        <Button title="Sign out" onPress={signOut} />
      </ScrollView>
    </ScreenLayout>
  );
};

const HouseholdsList = () => {
  const profileId = useAuthStore(selectCurrentProfileId);

  const handleCreateHousehold = useCallback(() => {
    createHouseholdForCurrentProfile({ name: new Date().toString() })();
  }, [profileId]);

  return (
    <>
      <Button title="Create household" onPress={handleCreateHousehold} />
    </>
  );
};

const SelectedHousehold = () => {
  const selectedHousehold = useHouseholdsStore(selectSelectedHousehold);

  const handleCreatePlant = useCallback(async () => {
    const create: TE.TaskEither<IErr, PlantModel> = pipe(
      selectedHousehold,
      O.map(household => household.id),
      TE.fromOption(() => "NOT_FOUND" as IErr),
      TE.chain(createPlantForHousehold())
    );
    await create();
  }, []);

  return pipe(
    selectedHousehold,
    O.fold(
      () => null,
      household => (
        <View>
          {household.name}
          <Button title="Add plant" onPress={handleCreatePlant} />
        </View>
      )
    )
  );
};

const ProfilesList = () => {
  const profiles = Object.values(useAuthStore(selectProfiles));
  return (
    <>
      <Heading style={{ marginTop: 50 }}>Profiles:</Heading>
      {profiles.map(profile => (
        <View
          key={profile.id}
          style={{ flexDirection: "row", marginVertical: 10 }}
        >
          <SubHeading style={{ flex: 1 }}>{profile.name}</SubHeading>
        </View>
      ))}
    </>
  );
};

const SplashScreen = () => {
  const { navigate } = useContext(NavigationContext);

  const handleSignUp = useCallback(() => {
    navigate(createSignUpRoute());
  }, []);

  const handleSignIn = useCallback(() => {
    navigate(createLoginRoute());
  }, []);

  return (
    <ScreenLayout>
      <Heading>Plantpal</Heading>
      <Button title="Create account" onPress={handleSignUp} />
      <Button title="Sign in" onPress={handleSignIn} />
    </ScreenLayout>
  );
};

const WelcomeWrapper = styled.View`
  margin-vertical: ${props => props.theme.spacing._18}px;
`;
