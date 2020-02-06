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
import { Button, View, ScrollView, Text, FlatList } from "react-native";
import { NavigationContext } from "react-navigation";
import {
  createLoginRoute,
  createSignUpRoute
} from "../../auth/navigation/routes";
import {
  useHouseholdsStore,
  selectHouseholdsAndPlants
} from "../../households/store/state";
import { createHouseholdForCurrentProfile } from "../../households/store/effects";
import { WelcomeMessage } from "../../profile/components/welcome-message";
import styled from "styled-components/native";
import { createPlantForHousehold } from "../../plants/store/effects";

export const Home = () => {
  const hasAuthenticated = useAuthStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <Households />;
  }

  return <SplashScreen />;
};

const Households = () => {
  const profileId = useAuthStore(selectCurrentProfileId);
  const householdWithPlants = useHouseholdsStore(selectHouseholdsAndPlants);
  const sectionListData = householdWithPlants.map(household => ({
    id: household.id,
    title: household.name,
    data: household.plants
  }));
  const profiles = Object.values(useAuthStore(selectProfiles));

  const handleCreateHousehold = useCallback(() => {
    createHouseholdForCurrentProfile({ name: new Date().toString() })();
  }, [profileId]);

  const handleAddPlant = useCallback((householdId: string) => {
    createPlantForHousehold()(householdId)();
  }, []);

  return (
    <ScreenLayout>
      <ScrollView>
        <WelcomeWrapper>
          <WelcomeMessage />
        </WelcomeWrapper>
        <Heading style={{ marginTop: 50 }}></Heading>
        {sectionListData.map(section => (
          <View key={section.id}>
            <View>
              <Heading>{section.title}</Heading>
              <Button
                title="Add plant"
                onPress={() => handleAddPlant(section.id)}
              />
            </View>
            <FlatList
              horizontal
              data={section.data}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View>
                  <Text style={{ color: "white" }}>{item.name}</Text>
                </View>
              )}
            />
          </View>
        ))}
        <Button title="Create household" onPress={handleCreateHousehold} />
        <Heading style={{ marginTop: 50 }}>Profiles:</Heading>
        {profiles.map(profile => (
          <View
            key={profile.id}
            style={{ flexDirection: "row", marginVertical: 10 }}
          >
            <SubHeading style={{ flex: 1 }}>{profile.name}</SubHeading>
          </View>
        ))}
        <Heading style={{ marginTop: 50 }}>Auth actions</Heading>
        <Button title="Sign out" onPress={signOut} />
      </ScrollView>
    </ScreenLayout>
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
