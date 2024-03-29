import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useEffect } from "react";
import { LogBox, StatusBar } from "react-native";
import "react-native-get-random-values";
import { ThemeProvider } from "styled-components";
import styled from "styled-components/native";
import { GlobalLoading } from "./features/auth/components/global-loading";
import { AuthMachineProvider } from "./features/auth/machine/machine";
import { AuthenticationSubscription } from "./features/auth/subscriptions/auth";
import { ProfilesSubscription } from "./features/auth/subscriptions/profiles";
import { CameraProvider } from "./features/camera/camera";
import { CurrentProfileHouseholdsSubscription } from "./features/households/subscriptions/current-profile-households";
import { ManageAuthMachineProvider } from "./features/manage/machine/machine";
import { HouseholdPlantsSubscription } from "./features/plants/subscriptions/household-plants";
import { HouseholdPhotosSubscription } from "./features/plants/subscriptions/plant-photos";
import { HouseholdTodosSubscription } from "./features/todos/subscriptions/household-todos";
import { useFonts } from "./hooks/fonts";
import { AppNavigation } from "./navigation/navigation";
import { initSentry } from "./sentry";
import {
  hydrateThemeSetting,
  selectCurrentProfileThemeIsDark,
  selectedSelectedOrMostRecentHouseholdId,
  selectInitializing,
  selectIsLoggedIn,
  selectThemeLoading,
} from "./store/selectors";
import { useStore } from "./store/state";
import { GlobalErrorProvider, selectFirestoresInitialising } from "./store/ui";
import { darkTheme, lightTheme } from "./theme";

initSentry();

export default () => {
  const themeLoading = useStore(selectThemeLoading);
  const fontsLoading = useFonts();
  const authInitializing = useStore(selectInitializing);
  const isDarkTheme = useStore(selectCurrentProfileThemeIsDark);
  const isFirestoreLoading = useStore(selectFirestoresInitialising);
  const isAuthenticated = useStore(selectIsLoggedIn);
  // Note that if the customer is not logged in, the firestores won't have loaded yet.
  // we don't want to show the loading splash if the customer is logged out
  const databaseLoading =
    isFirestoreLoading && authInitializing === false && isAuthenticated;

  const loading = themeLoading || fontsLoading || authInitializing;

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );

  useEffect(() => {
    hydrateThemeSetting();
  }, []);

  // We load the theme from async storage, so we can safely avoid loading data from Firebase here
  if (themeLoading) {
    return null;
  }

  const theme = isDarkTheme ? darkTheme : lightTheme;

  return (
    <>
      <AuthMachineProvider>
        <ManageAuthMachineProvider>
          <ThemeProvider theme={theme}>
            <GlobalErrorProvider loading={loading}>
              <CameraProvider>
                <>
                  <StatusBar barStyle={theme.type} />
                  <AppWrapper>
                    {loading ? null : (
                      <>
                        <CurrentProfileHouseholdsSubscription />
                        {selectedHouseholdId ? (
                          <>
                            <HouseholdPlantsSubscription
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
                      </>
                    )}
                    {fontsLoading ? null : (
                      <>
                        <AppNavigation />
                        <AuthenticationSubscription />
                        {/* Auth subscription navigates during onboarding rehydration, so navigation must be available (otherwise the navigation can happen before the navigator is available) */}
                      </>
                    )}
                  </AppWrapper>
                  <ProfilesSubscription />
                  <GlobalLoading
                    forceVisible={loading || databaseLoading}
                    solid={loading || databaseLoading}
                  />
                </>
              </CameraProvider>
            </GlobalErrorProvider>
          </ThemeProvider>
        </ManageAuthMachineProvider>
      </AuthMachineProvider>
    </>
  );
};

LogBox.ignoreAllLogs(true);

const AppWrapper = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.appBackground};
`;
