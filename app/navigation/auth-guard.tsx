import React from "react";
import { NavigationComponent } from "react-navigation";
import { SplashScreen } from "../features/auth/components/splash";
import { selectHasAuthenticated } from "../features/auth/store/state";
import { useStore } from "../store/state";

export const authGuard = (Screen: NavigationComponent<any, any>) => (
  props: any
) => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <Screen {...props} />;
  }

  return <SplashScreen />;
};
