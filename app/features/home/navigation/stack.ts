import { createStackNavigator } from "react-navigation-stack";
import { Home } from "../components/home";
import { HOME_SCREEN } from "./routes";
import { defaultStackConfig } from "../../../navigation/config";

export const HOME_STACK = "HOME_STACK";
export const HomeNavigator = createStackNavigator(
  {
    [HOME_SCREEN]: {
      screen: Home,
      navigationOptions: {
        title: "Home"
      }
    }
  },
  defaultStackConfig
);
