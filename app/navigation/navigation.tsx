import {
  faHandHoldingWater,
  faSeedling,
  faUserCircle,
} from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React from "react";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  BottomTabBarOptions,
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { SignIn, SIGN_IN_SCREEN } from "../features/auth/components/sign-in";
import { SignUp, SIGN_UP_SCREEN } from "../features/auth/components/sign-up";
import { careRoute } from "../features/care/components/care-screen";
import { careSessionRoute } from "../features/care/components/care-session-screen";
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
// import { logGlobalState } from "../store/state";
import { symbols, Theme } from "../theme";
import { useStore } from "../store/state";
import { selectHasAuthenticated } from "../features/auth/store/state";
import { Animated, Easing } from "react-native";
import styled, { withTheme } from "styled-components/native";
import { useRef } from "react";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const makeEmitter = <T extends any>() => {
  type Subscriber = (data: T) => void;
  let subs: Subscriber[] = [];
  return {
    emit: (data: T) => subs.forEach((fn) => fn(data)),
    subscribe: (fn: Subscriber) => {
      subs.push(fn);
      return () => subs.filter((fn) => fn !== fn);
    },
  };
};

const navigationIsAtRootBeacon = makeEmitter<boolean>();
export const navigationDidNavigateBeacon = makeEmitter<void>();

class TabBarComponent extends React.Component<
  BottomTabBarProps<BottomTabBarOptions> & { theme: Theme }
> {
  transformValue = new Animated.Value(0);
  unsubscribe: (() => void) | null = null;

  componentDidMount() {
    this.unsubscribe = navigationIsAtRootBeacon.subscribe((isAtRoot) => {
      Animated.timing(this.transformValue, {
        toValue: isAtRoot ? 0 : 1,
        duration: 120,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
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
    ];

    return (
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 0,
            width: "100%",
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
                  outputRange: [0, symbols.spacing.tabBarHeight],
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

const TabBar = withTheme(TabBarComponent);

const TabBarContainer = styled.SafeAreaView`
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
`;

const TabIcon = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: space-evenly;
  height: ${symbols.spacing.tabBarHeight};
`;

const PlantStack = () => (
  <Stack.Navigator headerMode="none">
    <Stack.Screen name={plantsRoute.routeName} component={plantsRoute.screen} />
    <Stack.Screen name={plantRoute.routeName} component={plantRoute.screen} />
    <Stack.Screen
      name={managePlantRoute.routeName}
      component={managePlantRoute.screen}
    />
    <Stack.Screen name={todoRoute.routeName} component={todoRoute.screen} />
    <Stack.Screen
      name={manageTodoRoute.routeName}
      component={manageTodoRoute.screen}
    />
    <Stack.Screen
      name={newPlantPictureRoute.routeName}
      component={newPlantPictureRoute.screen}
    />
    <Stack.Screen
      name={newPlantNicknameRoute.routeName}
      component={newPlantNicknameRoute.screen}
    />
    <Stack.Screen
      name={newPlantSuggestionRoute.routeName}
      component={newPlantSuggestionRoute.screen}
    />
    <Stack.Screen
      name={newPlantLocationRoute.routeName}
      component={newPlantLocationRoute.screen}
    />
  </Stack.Navigator>
);

const CareStack = () => (
  <Stack.Navigator headerMode="none">
    <Stack.Screen name={careRoute.routeName} component={careRoute.screen} />
    <Stack.Screen
      name={careSessionRoute.routeName}
      component={careSessionRoute.screen}
    />
  </Stack.Navigator>
);

export const AppNavigation = () => {
  const isLoggedIn = useStore(selectHasAuthenticated);
  const navigationRef = useRef<NavigationContainerRef>(null);
  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={(state) => {
        const indexes =
          state?.routes.map((route) => route.state?.index ?? 0) ?? [];
        const isAtRoot = indexes.every((index) => index === 0);
        navigationIsAtRootBeacon.emit(
          typeof isAtRoot === "undefined" || isAtRoot
        );
        navigationDidNavigateBeacon.emit();
      }}
    >
      {isLoggedIn ? (
        <Tab.Navigator tabBar={(props) => <TabBar {...props} />}>
          <Tab.Screen name={careRoute.routeName} component={CareStack} />
          <Tab.Screen name={plantsRoute.routeName} component={PlantStack} />
          <Tab.Screen
            name={manageRoute.routeName}
            component={manageRoute.screen}
          />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator headerMode="none">
          <Stack.Screen name={SIGN_IN_SCREEN} component={SignIn} />
          <Stack.Screen name={SIGN_UP_SCREEN} component={SignUp} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};
