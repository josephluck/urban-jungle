import React from "react";
import { createSwitchNavigator } from "react-navigation";
import { AUTH_STACK, AuthNavigator } from "../features/auth/navigation/stack";
import { Root } from "../features/care/components/care-screen";
import { Plants } from "../features/plants/components/plants-screen";
import { Manage } from "../features/manage/components/manage";
import { createStackNavigator } from "react-navigation-stack";
import { CARE_SCREEN } from "../features/care/navigation/routes";
import { createBottomTabNavigator } from "react-navigation-tabs";
import {
  faHandHoldingWater,
  faSeedling,
  faUserCircle,
} from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { symbols } from "../theme";
import {
  PLANT_SCREEN,
  Plant,
} from "../features/plants/components/plant-screen";
import {
  CareSession,
  CARE_SESSION_SCREEN,
} from "../features/care/components/care-session-screen";

const CareStack = createStackNavigator(
  {
    [CARE_SCREEN]: Root,
    [CARE_SESSION_SCREEN]: CareSession,
  },
  {
    initialRouteName: CARE_SCREEN,
    headerMode: "none",
    navigationOptions: {
      headerShown: false,
    },
  }
);

const PLANTS_SCREEN = "PLANTS_SCREEN";

const PlantsStack = createStackNavigator(
  {
    [PLANTS_SCREEN]: Plants,
    [PLANT_SCREEN]: Plant,
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
    [MANAGE_SCREEN]: Manage,
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
    [CARE_SCREEN]: CareStack,
    [PLANTS_SCREEN]: PlantsStack,
    [MANAGE_SCREEN]: ManageStack,
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarOnPress: ({ navigation, defaultHandler }: any) => {
        navigation.popToTop();
        defaultHandler();
      },

      tabBarOptions: {
        showLabel: false,
        style: {
          backgroundColor: symbols.colors.appBackground,
          borderTopWidth: 0,
          height: tabIconSize + tabBarPadding * 2,
        },
      },

      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        const icon =
          routeName === CARE_SCREEN
            ? faHandHoldingWater
            : routeName === PLANTS_SCREEN
            ? faSeedling
            : faUserCircle;
        return (
          <FontAwesomeIcon
            icon={icon}
            size={tabIconSize}
            color={focused ? symbols.colors.solidBlue : symbols.colors.offWhite}
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
