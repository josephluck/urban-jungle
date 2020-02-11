import React, { useCallback, useContext } from "react";
import { Heading, BodyText } from "../../../components/typography";
import { ScreenLayout } from "../../../components/screen-layout";
import { selectHasAuthenticated } from "../../auth/store/state";
import { signOut } from "../../auth/store/effects";
import { Button, View, ScrollView } from "react-native";
import { NavigationContext, FlatList } from "react-navigation";
import {
  createLoginRoute,
  createSignUpRoute
} from "../../auth/navigation/routes";
import { selectSelectedHousehold } from "../../households/store/state";
import { createPlantForHousehold } from "../../plants/store/effects";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { HouseholdPlantsSubscription } from "../../plants/subscriptions/household-plants";
import { selectPlantsByHouseholdId } from "../../plants/store/state";
import { useStore } from "../../../store/state";
import { HouseholdsSelection } from "../../households/components/households-selection";

export const Home = () => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <HomeScreen />;
  }

  return <SplashScreen />;
};

const HomeScreen = () => {
  return (
    <ScreenLayout>
      <ScrollView>
        <HouseholdsSelection />
        <SelectedHousehold />
        <Button title="Sign out" onPress={signOut} />
      </ScrollView>
    </ScreenLayout>
  );
};

const SelectedHousehold = () => {
  const selectedHousehold = useStore(selectSelectedHousehold);

  return pipe(
    selectedHousehold,
    O.fold(
      () => null,
      household => (
        <View>
          <PlantsList householdId={household.id} />
        </View>
      )
    )
  );
};

const PlantsList = ({ householdId }: { householdId: string }) => {
  const plants = useStore(() => selectPlantsByHouseholdId(householdId), [
    householdId
  ]);

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
            <BodyText>{item.name}</BodyText>
          </View>
        )}
        ListFooterComponent={
          <Button title="Add plant" onPress={handleCreatePlant} />
        }
      />
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
