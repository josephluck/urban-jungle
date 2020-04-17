import { createSwitchNavigator } from "react-navigation";
import { AUTH_STACK, AuthNavigator } from "../features/auth/navigation/stack";
import { Home } from "../features/home/components/home";
import { createStackNavigator } from "react-navigation-stack";
import { HOME_SCREEN } from "../features/home/navigation/routes";

const PrivateStack = createStackNavigator(
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

const PRIVATE_STACK = "PRIVATE_STACK";

export const AppNavigation = createSwitchNavigator(
  {
    [AUTH_STACK]: {
      screen: AuthNavigator,
    },
    [PRIVATE_STACK]: {
      screen: PrivateStack,
    },
  },
  {
    initialRouteName: PRIVATE_STACK,
  }
);
