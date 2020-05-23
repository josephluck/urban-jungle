import React, { useEffect } from "react";
import { AppNavigation } from "./navigation/navigation";
import { createAppContainer } from "react-navigation";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "./theme";
import styled from "styled-components/native";
import { useFonts } from "./hooks/fonts";
// import * as reactotron from "./reactotron";
import { initialize } from "./features/auth/store/effects";
import { ActivityIndicator, StatusBar } from "react-native";
import { selectInitializing } from "./features/auth/store/state";
import { ProfilesSubscription } from "./features/auth/subscriptions/profiles";
import { useStore } from "./store/state";
import { CurrentProfileHouseholdsSubscription } from "./features/households/subscriptions/current-profile-households";
import { selectedSelectedOrMostRecentHouseholdId } from "./features/households/store/state";
import { HouseholdPlantsSubscription } from "./features/plants/subscriptions/household-plants";
import { HouseholdCaresSubscription } from "./features/care/subscriptions/household-cares";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { HouseholdTodosSubscription } from "./features/todos/subscriptions/household-todos";
import { ContextMenuProvider, ContextMenu } from "./components/context-menu";
import { HouseholdPhotosSubscription } from "./features/plants/subscriptions/plant-photos";
import { GlobalLoading } from "./components/global-loading";

// reactotron.configure();

const AppContainer = createAppContainer(AppNavigation);

export default () => {
  const fontsLoading = useFonts();
  const authInitializing = useStore(selectInitializing);

  useEffect(() => {
    initialize();
  }, []);

  const loading = fontsLoading || authInitializing;

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );

  return (
    <ThemeProvider theme={lightTheme}>
      <ContextMenuProvider>
        <StatusBar barStyle={lightTheme.type} />
        <AppWrapper>
          {loading ? (
            <LoadingContainer>
              <ActivityIndicator size="large" />
            </LoadingContainer>
          ) : (
            <>
              <CurrentProfileHouseholdsSubscription />
              {selectedHouseholdId ? (
                <>
                  <HouseholdPlantsSubscription
                    householdId={selectedHouseholdId}
                  />
                  <HouseholdCaresSubscription
                    householdId={selectedHouseholdId}
                  />
                  <HouseholdTodosSubscription
                    householdId={selectedHouseholdId}
                  />
                  <HouseholdPhotosSubscription
                    householdId={selectedHouseholdId}
                  />
                </>
              ) : null}
              <AppContainer />
            </>
          )}
        </AppWrapper>
        <ProfilesSubscription />
        <ContextMenu />
        <GlobalLoading />
      </ContextMenuProvider>
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
