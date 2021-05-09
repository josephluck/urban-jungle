import {
  faHandHoldingWater,
  faSeedling,
  faUserCircle,
} from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  BottomTabBarOptions,
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { Insets } from "react-native";
import Animated, { Easing } from "react-native-reanimated";
import { withSafeAreaInsets } from "react-native-safe-area-context";
import styled, { withTheme } from "styled-components/native";
import { TouchableOpacity } from "../components/touchable-opacity";
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
import { careSessionRoute } from "../features/care/components/care-session-screen";
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
// import { logGlobalState } from "../store/state";
import { symbols, Theme } from "../theme";
import {
  navigationDidNavigateBeacon,
  navigationIsAtRootBeacon,
} from "./beacon";
import { navigationRef } from "./navigation-imperative";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

class TabBarComponent extends React.Component<
  BottomTabBarProps<BottomTabBarOptions> & { theme: Theme } & {
    insets?: Insets;
  }
> {
  transformValue = new Animated.Value(0);
  unsubscribe: (() => void) | null = null;

  componentDidMount() {
    this.unsubscribe = navigationIsAtRootBeacon.subscribe((isAtRoot) => {
      Animated.timing(this.transformValue, {
        toValue: isAtRoot ? 0 : 1,
        duration: 120,
        easing: Easing.inOut(Easing.ease),
      }).start();
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    const tabIconSize = 28;

    const { name: currentScreenName } = this.props.state.routes[
      this.props.state.index
    ] || { name: "unknown" };

    const { bottom: safeAreaBottom = 0 } = this.props.insets || {};

    return (
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 0,
            width: "100%",
            alignItems: "center",
            backgroundColor: this.props.theme.appBackground,
          },
          {
            opacity: this.transformValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
            transform: [
              {
                translateY: this.transformValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    -safeAreaBottom,
                    symbols.spacing.tabBarHeight + safeAreaBottom,
                  ],
                }),
              },
            ],
          },
        ]}
      >
        <TabBarContainer>
          {[careRoute, plantsRoute, manageRoute].map((route) => (
            <TabIcon
              key={route.routeName}
              onPress={() => route.navigateTo(this.props.navigation, {})}
            >
              <FontAwesomeIcon
                icon={
                  route === careRoute
                    ? faHandHoldingWater
                    : route === plantsRoute
                    ? faSeedling
                    : faUserCircle
                }
                size={tabIconSize}
                color={
                  currentScreenName === route.routeName
                    ? this.props.theme.tabBarActive
                    : this.props.theme.tabBarInactive
                }
              />
            </TabIcon>
          ))}
        </TabBarContainer>
      </Animated.View>
    );
  }
}

const TabBar = withSafeAreaInsets(withTheme(TabBarComponent));

const TabBarContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  flex: 1;
`;

const TabIcon = styled(TouchableOpacity)`
  flex: 1;
  align-items: center;
  justify-content: space-evenly;
  height: ${symbols.spacing.tabBarHeight};
  width: 80;
`;

const PlantStack = () => (
  <Stack.Navigator headerMode="none">
    {[
      plantsRoute,
      plantRoute,
      managePlantRoute,
      todoRoute,
      manageTodoRoute,
      newPlantPictureRoute,
      newPlantNicknameRoute,
      newPlantSuggestionRoute,
      newPlantLocationRoute,
    ].map((route) => (
      <Stack.Screen
        key={route.routeName}
        name={route.routeName}
        component={route.screen}
      />
    ))}
  </Stack.Navigator>
);

const CareStack = () => (
  <Stack.Navigator headerMode="none">
    {[careRoute, careSessionRoute].map((route) => (
      <Stack.Screen
        key={route.routeName}
        name={route.routeName}
        component={route.screen}
      />
    ))}
  </Stack.Navigator>
);

const ManageStack = () => (
  <Stack.Navigator headerMode="none">
    {[
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
);

export const AppNavigation = () => {
  const isLoggedIn = useStore(selectHasAuthenticated);
  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={(state) => {
        const indexes =
          state?.routes.map((route) => route.state?.index ?? 0) ?? [];
        const isAtRoot = indexes.every((index) => index === 0);
        navigationIsAtRootBeacon.emit(
          typeof isAtRoot === "undefined" || isAtRoot,
        );
        navigationDidNavigateBeacon.emit();
      }}
    >
      {isLoggedIn ? (
        <Tab.Navigator tabBar={(props) => <TabBar {...props} />}>
          <Tab.Screen name={careRoute.routeName} component={CareStack} />
          <Tab.Screen name={plantsRoute.routeName} component={PlantStack} />
          <Tab.Screen name={manageRoute.routeName} component={ManageStack} />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator headerMode="none">
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
