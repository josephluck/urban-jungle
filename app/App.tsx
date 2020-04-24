import React, { useEffect } from "react";
import { AppNavigation } from "./navigation/navigation";
import { createAppContainer } from "react-navigation";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "./theme";
import styled from "styled-components/native";
import { useFonts } from "./hooks/fonts";
// import * as reactotron from "./reactotron";
import { initialize } from "./features/auth/store/effects";
import "./firebase";
import { ActivityIndicator, StatusBar } from "react-native";
import { selectInitializing } from "./features/auth/store/state";
import { ProfilesSubscription } from "./features/auth/subscriptions/profiles";
import { useStore } from "./store/state";
import { CurrentProfileHouseholdsSubscription } from "./features/households/subscriptions/current-profile-households";

// reactotron.configure();

const AppContainer = createAppContainer(AppNavigation);

export default () => {
  const fontsLoading = useFonts();
  const authInitializing = useStore(selectInitializing);

  useEffect(() => {
    initialize();
  }, []);

  const loading = fontsLoading || authInitializing;

  return (
    <ThemeProvider theme={lightTheme}>
      <StatusBar barStyle={lightTheme.type} />
      <AppWrapper>
        {loading ? (
          <LoadingContainer>
            <ActivityIndicator size="large" />
          </LoadingContainer>
        ) : (
          <>
            <CurrentProfileHouseholdsSubscription />
            <AppContainer />
          </>
        )}
      </AppWrapper>
      <ProfilesSubscription />
    </ThemeProvider>
  );
};

console.disableYellowBox = true;

const AppWrapper = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.appBackground};
`;

const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
