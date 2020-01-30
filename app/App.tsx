import React, { useEffect } from "react";
import { AppNavigation } from "./navigation/navigation";
import { createAppContainer } from "react-navigation";
import { ThemeProvider } from "styled-components";
import { theme } from "./theme";
import styled from "styled-components/native";
import { useFonts } from "./hooks/fonts";
import * as reactotron from "./reactotron";
import * as auth from "./features/auth/store";
import "./firebase";

reactotron.configure();

const AppContainer = createAppContainer(AppNavigation);

export default () => {
  const fontsLoading = useFonts();
  const authInitializing = auth.useAuthStore(auth.selectInitializing);

  useEffect(() => {
    auth.initialize();
  }, []);

  const loading = fontsLoading || authInitializing;

  return (
    <ThemeProvider theme={theme}>
      <AppWrapper>{!loading && <AppContainer />}</AppWrapper>
    </ThemeProvider>
  );
};

const AppWrapper = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.offBlack};
`;
