import {
  NavigationStackConfig,
  NavigationStackOptions,
  NavigationStackProp,
} from "react-navigation-stack";
import {
  CreateNavigatorConfig,
  NavigationStackRouterConfig,
  NavigationRoute,
} from "react-navigation";

export const defaultStackConfig: CreateNavigatorConfig<
  NavigationStackConfig,
  NavigationStackRouterConfig,
  NavigationStackOptions,
  NavigationStackProp<NavigationRoute, any>
> = {
  headerMode: "none",
  defaultNavigationOptions: {
    headerTintColor: "transparent",
    cardStyle: {
      backgroundColor: "transparent",
    },
    headerStyle: {
      borderBottomWidth: 0,
      elevation: 0,
      borderWidth: 0,
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowColor: "transparent",
    },
  },
};
