import React, { useEffect } from "react";
import { AppNavigation } from "./navigation/navigation";
import { createAppContainer } from "react-navigation";
import { ThemeProvider } from "styled-components";
import { theme } from "./theme";
import styled from "styled-components/native";
import { useFonts } from "./hooks/fonts";
import * as reactotron from "./reactotron";
import { initialize } from "./features/auth/store/effects";
import "./firebase";
import { ActivityIndicator } from "react-native";
import { useAuthStore, selectInitializing } from "./features/auth/store/state";
import { CurrentProfileHouseholdsSubscription } from "./features/households/subscriptions/current-profile-households";

reactotron.configure();

const AppContainer = createAppContainer(AppNavigation);

export default () => {
  const fontsLoading = useFonts();
  const authInitializing = useAuthStore(selectInitializing);

  useEffect(() => {
    initialize();
  }, []);

  const loading = fontsLoading || authInitializing;

  return (
    <ThemeProvider theme={theme}>
      <AppWrapper>
        {loading ? (
          <LoadingContainer>
            <ActivityIndicator size="large" />
          </LoadingContainer>
        ) : (
          <AppContainer />
        )}
      </AppWrapper>
      <CurrentProfileHouseholdsSubscription />
    </ThemeProvider>
  );
};

const AppWrapper = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.offBlack};
`;

const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
