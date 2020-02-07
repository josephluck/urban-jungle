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
import { Button, View, ScrollView, Text, TouchableOpacity } from "react-native";
import { NavigationContext, FlatList } from "react-navigation";
import {
  createLoginRoute,
  createSignUpRoute
} from "../../auth/navigation/routes";
import {
  useHouseholdsStore,
  selectSelectedHousehold,
  selectHouseholds
} from "../../households/store/state";
import {
  createHouseholdForCurrentProfile,
  storeSelectedHouseholdIdToStorage
} from "../../households/store/effects";
import { WelcomeMessage } from "../../profile/components/welcome-message";
import styled from "styled-components/native";
import { createPlantForHousehold } from "../../plants/store/effects";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { HouseholdPlantsSubscription } from "../../plants/subscriptions/household-plants";
import {
  usePlantsStore,
  selectPlantsByHouseholdId
} from "../../plants/store/state";
import { CurrentProfileHouseholdsSubscription } from "../../households/subscriptions/current-profile-households";

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
  const households = useHouseholdsStore(selectHouseholds);

  const handleCreateHousehold = useCallback(() => {
    createHouseholdForCurrentProfile({ name: new Date().toString() })();
  }, [profileId]);

  const handleSelectHousehold = useCallback(async (householdId: string) => {
    await storeSelectedHouseholdIdToStorage(householdId)();
  }, []);

  return (
    <>
      <CurrentProfileHouseholdsSubscription />
      <Heading style={{ marginTop: 50 }}>Households:</Heading>
      <FlatList
        style={{ height: 200 }}
        data={households}
        keyExtractor={household => household.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectHousehold(item.id)}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <Button title="Add household" onPress={handleCreateHousehold} />
        }
      />
    </>
  );
};

const SelectedHousehold = () => {
  const selectedHousehold = useHouseholdsStore(selectSelectedHousehold);

  return pipe(
    selectedHousehold,
    O.fold(
      () => null,
      household => (
        <View>
          <Heading style={{ marginTop: 50 }}>{household.name}</Heading>
          {/* TODO: this fails */}
          <PlantsList householdId={household.id} />
        </View>
      )
    )
  );
};

const PlantsList = ({ householdId }: { householdId: string }) => {
  const plants = usePlantsStore(() => selectPlantsByHouseholdId(householdId));

  const handleCreatePlant = useCallback(async () => {
    await createPlantForHousehold()(householdId)();
  }, [householdId]);

  return (
    <>
      <HouseholdPlantsSubscription householdId={householdId} />
      <FlatList
        style={{ height: 200 }}
        data={plants}
        keyExtractor={plant => plant.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
          </View>
        )}
        ListFooterComponent={
          <Button title="Add plant" onPress={handleCreatePlant} />
        }
      />
    </>
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
