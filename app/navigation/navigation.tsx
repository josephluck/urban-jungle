import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { signUpEmailRoute } from "../features/auth/components/sign-up-email";
import { signUpNameRoute } from "../features/auth/components/sign-up-name";
import { signUpPasswordRoute } from "../features/auth/components/sign-up-password";
import { signUpPhoneRoute } from "../features/auth/components/sign-up-phone";
import { signUpPhoneVerifyRoute } from "../features/auth/components/sign-up-phone-verify";
import { signUpResetPasswordRoute } from "../features/auth/components/sign-up-reset-password";
import { signUpResetPasswordInstructionsRoute } from "../features/auth/components/sign-up-reset-password-instructions";
import { splashRoute } from "../features/auth/components/splash";
import { selectHasAuthenticated } from "../features/auth/store/state";
import { careRoute } from "../features/care/components/care-screen";
import { manageProfileRoute } from "../features/manage/components/manage-profile";
import { manageProfileChooseAuthVerify } from "../features/manage/components/manage-profile-choose-auth-verify";
import { manageProfileEmail } from "../features/manage/components/manage-profile-email";
import { manageProfilePassword } from "../features/manage/components/manage-profile-password";
import { manageProfilePhone } from "../features/manage/components/manage-profile-phone";
import { manageProfilePhoneVerify } from "../features/manage/components/manage-profile-phone-verify";
import { manageRoute } from "../features/manage/components/manage-screen";
import { managePlantRoute } from "../features/plants/components/manage-plant-screen";
import { newPlantLocationRoute } from "../features/plants/components/new-plant/new-plant-location-screen";
import { newPlantNicknameRoute } from "../features/plants/components/new-plant/new-plant-nickname-screen";
import { newPlantPictureRoute } from "../features/plants/components/new-plant/new-plant-picture-screen";
import { newPlantSuggestionRoute } from "../features/plants/components/new-plant/new-plant-suggestion-screen";
import { plantRoute } from "../features/plants/components/plant-screen";
import { plantsRoute } from "../features/plants/components/plants-screen";
import { manageTodoRoute } from "../features/todos/components/manage-todo-screen";
import { todoRoute } from "../features/todos/components/todo-screen";
import { useStore } from "../store/state";
import { navigationDidNavigateBeacon } from "./beacon";
import { navigationRef } from "./navigation-imperative";

const Stack = createStackNavigator();

// TODO: use nested navigators for popToTop etc...
export const AppNavigation = () => {
  const isLoggedIn = useStore(selectHasAuthenticated);
  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {
        navigationDidNavigateBeacon.emit();
      }}
    >
      {isLoggedIn ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {[
            // Care
            careRoute,
            // Plants
            plantsRoute,
            plantRoute,
            managePlantRoute,
            todoRoute,
            manageTodoRoute,
            newPlantPictureRoute,
            newPlantNicknameRoute,
            newPlantSuggestionRoute,
            newPlantLocationRoute,
            // Manage
            manageRoute,
            manageProfileRoute,
            manageProfileChooseAuthVerify,
            manageProfileEmail,
            manageProfilePassword,
            manageProfilePhone,
            manageProfilePhoneVerify,
          ].map((route) => (
            <Stack.Screen
              key={route.routeName}
              name={route.routeName}
              component={route.screen}
            />
          ))}
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {[
            splashRoute,
            signUpPhoneRoute,
            signUpPhoneVerifyRoute,
            signUpEmailRoute,
            signUpNameRoute,
            signUpPasswordRoute,
            signUpResetPasswordRoute,
            signUpResetPasswordInstructionsRoute,
          ].map((route) => (
            <Stack.Screen
              key={route.routeName}
              name={route.routeName}
              component={route.screen}
            />
          ))}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};
