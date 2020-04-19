import React from "react";
import { createSwitchNavigator } from "react-navigation";
import { AUTH_STACK, AuthNavigator } from "../features/auth/navigation/stack";
import { Home } from "../features/home/components/home";
import { createStackNavigator } from "react-navigation-stack";
import { HOME_SCREEN } from "../features/home/navigation/routes";
import { createBottomTabNavigator } from "react-navigation-tabs";
import {
  faCalendar,
  faSeedling,
  faUserCircle,
} from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { symbols } from "../theme";

const HomeStack = createStackNavigator(
  {
    [HOME_SCREEN]: {
      screen: Home,
    },
  },
  {
    initialRouteName: HOME_SCREEN,
    headerMode: "none",
    navigationOptions: {
      headerShown: false,
    },
  }
);

const PLANTS_SCREEN = "PLANTS_SCREEN";

const PlantsStack = createStackNavigator(
  {
    [PLANTS_SCREEN]: {
      screen: () => <></>,
    },
  },
  {
    initialRouteName: PLANTS_SCREEN,
    headerMode: "none",
    navigationOptions: {
      headerShown: false,
    },
  }
);

const MANAGE_SCREEN = "MANAGE_SCREEN";

const ManageStack = createStackNavigator(
  {
    [MANAGE_SCREEN]: {
      screen: () => <></>,
    },
  },
  {
    initialRouteName: MANAGE_SCREEN,
    headerMode: "none",
    navigationOptions: {
      headerShown: false,
    },
  }
);

const tabIconSize = 28;
const tabBarPadding = symbols.spacing._12;

const PrivateTabs = createBottomTabNavigator(
  {
    [HOME_SCREEN]: HomeStack,
    [PLANTS_SCREEN]: PlantsStack,
    [MANAGE_SCREEN]: ManageStack,
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarOptions: {
        showLabel: false,
        style: {
          borderTopWidth: 0,
          height: tabIconSize + tabBarPadding * 2,
        },
      },

      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        const icon =
          routeName === HOME_SCREEN
            ? faCalendar
            : routeName === PLANTS_SCREEN
            ? faSeedling
            : faUserCircle;
        return (
          <FontAwesomeIcon
            icon={icon}
            size={tabIconSize}
            color={
              focused ? symbols.colors.solidBlue : symbols.colors.lightOffGray
            }
          />
        );
      },
    }),
  }
);

const PRIVATE_STACK = "PRIVATE_STACK";

export const AppNavigation = createSwitchNavigator(
  {
    [AUTH_STACK]: {
      screen: AuthNavigator,
    },
    [PRIVATE_STACK]: {
      screen: PrivateTabs,
    },
  },
  {
    initialRouteName: PRIVATE_STACK,
  }
);
