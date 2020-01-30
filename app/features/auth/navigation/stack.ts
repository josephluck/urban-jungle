import { createStackNavigator } from "react-navigation-stack";
import { SignIn } from "../components/sign-in";
import { SignUp } from "../components/sign-up";
import { SIGN_IN_SCREEN, SIGN_UP_SCREEN } from "./routes";
import { defaultStackConfig } from "../../../navigation/config";

export const AUTH_STACK = "AUTH_STACK";
export const AuthNavigator = createStackNavigator(
  {
    [SIGN_IN_SCREEN]: {
      screen: SignIn,
      navigationOptions: {
        title: "Sign in"
      }
    },
    [SIGN_UP_SCREEN]: {
      screen: SignUp,
      navigationOptions: {
        title: "Sign up"
      }
    }
  },
  defaultStackConfig
);
