import {
  faHandHoldingWater,
  faSeedling,
  faUserCircle,
} from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React from "react";
import { createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { SignIn, SIGN_IN_SCREEN } from "../features/auth/components/sign-in";
import { SignUp, SIGN_UP_SCREEN } from "../features/auth/components/sign-up";
import { authGuard } from "../features/auth/components/splash";
import {
  CareScreen,
  CARE_SCREEN,
} from "../features/care/components/care-screen";
import {
  CareSessionScreen,
  CARE_SESSION_SCREEN,
} from "../features/care/components/care-session-screen";
import { ManageScreen } from "../features/manage/components/manage";
import {
  PlantScreen,
  PLANT_SCREEN,
} from "../features/plants/components/plant-screen";
import { PlantsScreen } from "../features/plants/components/plants-screen";
import { symbols } from "../theme";

const CareStack = createStackNavigator(
  {
    [CARE_SCREEN]: authGuard(CareScreen),
    [CARE_SESSION_SCREEN]: authGuard(CareSessionScreen),
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
    [PLANTS_SCREEN]: authGuard(PlantsScreen),
    [PLANT_SCREEN]: authGuard(PlantScreen),
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
    [MANAGE_SCREEN]: authGuard(ManageScreen),
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

const AuthNavigator = createStackNavigator(
  {
    [SIGN_IN_SCREEN]: {
      screen: SignIn,
      navigationOptions: {
        title: "Sign in",
      },
    },
    [SIGN_UP_SCREEN]: {
      screen: SignUp,
      navigationOptions: {
        title: "Sign up",
      },
    },
  },
  {
    headerMode: "none",
    navigationOptions: {
      headerShown: false,
    },
  }
);

const AUTH_STACK = "AUTH_STACK";

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
