import React from "react";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faHome,
  faCircle,
  IconDefinition
} from "@fortawesome/pro-regular-svg-icons";
import { HOME_STACK, HomeNavigator } from "../features/home/navigation/stack";
import { theme } from "../theme";

type TabNames = typeof HOME_STACK;

export const AppNavigation = createBottomTabNavigator(
  {
    [HOME_STACK]: {
      screen: HomeNavigator,
      navigationOptions: {
        tabBarLabel: "Home"
      }
    }
  },
  {
    initialRouteName: HOME_STACK,
    resetOnBlur: true,
    tabBarOptions: {
      activeTintColor: theme.colors.nearWhite,
      inactiveTintColor: theme.colors.lightOffGray,
      style: {
        borderTopWidth: 0,
        borderTopColor: "transparent",
        borderTopRightRadius: theme.borderRadius.large,
        borderTopLeftRadius: theme.borderRadius.large,
        backgroundColor: theme.colors.deepGray
      }
    },
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ tintColor }) => {
        const { routeName } = navigation.state;
        return (
          <FontAwesomeIcon
            icon={getTabIcon(routeName as TabNames)}
            style={{ color: tintColor }}
            size={theme.size.iconBottomTabBar}
          />
        );
      }
    })
  }
);

function getTabIcon(route: TabNames): IconDefinition {
  switch (route) {
    case HOME_STACK:
      return faHome;
    default:
      return faCircle;
  }
}
