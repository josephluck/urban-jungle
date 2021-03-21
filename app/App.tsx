import { GatewayDest, GatewayProvider } from "@chardskarth/react-gateway";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";
import { LogBox, StatusBar } from "react-native";
import { ThemeProvider } from "styled-components";
import styled from "styled-components/native";
import { BottomSheetGatewayContainer } from "./components/bottom-drawer";
import { CameraProvider } from "./components/camera";
import {
  contextMenuGatewayId,
  ContextMenuProvider,
} from "./components/context-menu";
import { GlobalLoading } from "./components/global-loading";
import { AuthMachineProvider } from "./features/auth/machine/machine";
// import * as reactotron from "./reactotron";
import { selectInitializing } from "./features/auth/store/state";
import { AuthenticationSubscription } from "./features/auth/subscriptions/auth";
import { ProfilesSubscription } from "./features/auth/subscriptions/profiles";
import { HouseholdCaresSubscription } from "./features/care/subscriptions/household-cares";
import { selectedSelectedOrMostRecentHouseholdId } from "./features/households/store/state";
import { CurrentProfileHouseholdsSubscription } from "./features/households/subscriptions/current-profile-households";
import { ManageAuthMachineProvider } from "./features/manage/machine/machine";
import { HouseholdPlantsSubscription } from "./features/plants/subscriptions/household-plants";
import { HouseholdPhotosSubscription } from "./features/plants/subscriptions/plant-photos";
import { selectCurrentProfileThemeIsDark } from "./features/profiles/store/state";
import { HouseholdTodosSubscription } from "./features/todos/subscriptions/household-todos";
import { useFonts } from "./hooks/fonts";
import { AppNavigation } from "./navigation/navigation";
import { useStore } from "./store/state";
import { GlobalErrorProvider } from "./store/ui";
import { darkTheme, lightTheme } from "./theme";

// reactotron.configure();

export default () => {
  const isDarkTheme = useStore(selectCurrentProfileThemeIsDark);
  const fontsLoading = useFonts();
  const authInitializing = useStore(selectInitializing);

  const loading = fontsLoading || authInitializing;

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );

  const theme = isDarkTheme ? darkTheme : lightTheme;

  return (
    <AuthMachineProvider>
      <ManageAuthMachineProvider>
        <ThemeProvider theme={theme}>
          <ContextMenuProvider>
            <GlobalErrorProvider loading={loading}>
              <CameraProvider>
                <GatewayProvider>
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
                    <GlobalLoading />
                    <GatewayDest
                      name={contextMenuGatewayId}
                      component={BottomSheetGatewayContainer}
                    />
                  </>
                </GatewayProvider>
              </CameraProvider>
            </GlobalErrorProvider>
          </ContextMenuProvider>
        </ThemeProvider>
      </ManageAuthMachineProvider>
    </AuthMachineProvider>
  );
};

console.disableYellowBox = true;
LogBox.ignoreAllLogs(true);

const AppWrapper = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.appBackground};
`;
