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
import { careRoute } from "../features/care/components/care-screen";
import { careSessionRoute } from "../features/care/components/care-session-screen";
import { manageRoute } from "../features/manage/components/manage-screen";
import { managePlantRoute } from "../features/plants/components/manage-plant-screen";
import { newPlantPictureRoute } from "../features/plants/components/new-plant/new-plant-picture-screen";
import { plantRoute } from "../features/plants/components/plant-screen";
import { plantsRoute } from "../features/plants/components/plants-screen";
import { manageTodoRoute } from "../features/todos/components/manage-todo-screen";
import { todoRoute } from "../features/todos/components/todo-screen";
import { logGlobalState } from "../store/state";
import { symbols } from "../theme";

const CareStack = createStackNavigator(
  {
    [careRoute.routeName]: careRoute.screen,
    [careSessionRoute.routeName]: careSessionRoute.screen,
  },
  {
    initialRouteName: careRoute.routeName,
    headerMode: "none",
    navigationOptions: {
      headerShown: false,
    },
  }
);

const PlantsStack = createStackNavigator(
  {
    [plantsRoute.routeName]: plantsRoute.screen,
    [plantRoute.routeName]: plantRoute.screen,
    [managePlantRoute.routeName]: managePlantRoute.screen,
    [todoRoute.routeName]: todoRoute.screen,
    [manageTodoRoute.routeName]: manageTodoRoute.screen,
    [newPlantPictureRoute.routeName]: newPlantPictureRoute.screen,
  },
  {
    initialRouteName: plantsRoute.routeName,
    headerMode: "none",
    navigationOptions: {
      headerShown: false,
    },
  }
);

const ManageStack = createStackNavigator(
  {
    [manageRoute.routeName]: manageRoute.screen,
  },
  {
    initialRouteName: manageRoute.routeName,
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
    [careRoute.routeName]: CareStack,
    [plantsRoute.routeName]: PlantsStack,
    [manageRoute.routeName]: ManageStack,
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarOnPress: ({ navigation, defaultHandler }: any) => {
        logGlobalState();
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
          routeName === careRoute.routeName
            ? faHandHoldingWater
            : routeName === plantsRoute.routeName
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
