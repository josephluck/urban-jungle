import React, { useCallback, useContext } from "react";
import { pipe } from "fp-ts/lib/pipeable";
import { Heading, SubHeading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/screen-layout";
import {
  useAuthStore,
  selectHasAuthenticated,
  selectCurrentProfileEmail,
  selectCurrentProfileId,
  selectCurrentProfileName
} from "../../auth/store/state";
import { signOut } from "../../auth/store/effects";
import { Button, View } from "react-native";
import { NavigationContext } from "react-navigation";
import {
  createLoginRoute,
  createSignUpRoute
} from "../../auth/navigation/routes";
import {
  useHouseholdsStore,
  selectHouseholds
} from "../../households/store/state";
import {
  removeHousehold,
  createHouseholdForCurrentProfile
} from "../../households/store/effects";
import * as O from "fp-ts/lib/Option";

export const Home = () => {
  const hasAuthenticated = useAuthStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <Households />;
  }

  return <SplashScreen />;
};

const Households = () => {
  const name = useAuthStore(selectCurrentProfileName);
  const email = useAuthStore(selectCurrentProfileEmail);
  const profileId = useAuthStore(selectCurrentProfileId);
  const households = useHouseholdsStore(selectHouseholds);

  const handleCreateHousehold = useCallback(() => {
    createHouseholdForCurrentProfile({ name: new Date().toString() })();
  }, [profileId]);

  const handleRemoveHousehold = useCallback((id: string) => {
    removeHousehold(id);
  }, []);

  return (
    <ScreenLayout>
      <Heading>
        Hello{" "}
        {pipe(
          name,
          O.getOrElse(() => "")
        )}
      </Heading>
      <SubHeading>
        {pipe(
          email,
          O.getOrElse(() => "")
        )}
      </SubHeading>
      {households.map(household => (
        <View
          key={household.id}
          style={{ flexDirection: "row", marginVertical: 10 }}
        >
          <Heading style={{ flex: 1 }}>{household.name}</Heading>
          <Button
            title="X"
            onPress={() => handleRemoveHousehold(household.id)}
          />
        </View>
      ))}
      <Button title="Create household" onPress={handleCreateHousehold} />
      <Button title="Sign out" onPress={signOut} />
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
