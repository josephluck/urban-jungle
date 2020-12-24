import { GatewayDest, GatewayProvider } from "@chardskarth/react-gateway";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useContext, useEffect } from "react";
import { useRef } from "react";
import { ActivityIndicator, Animated, Easing, StatusBar } from "react-native";
import { ThemeProvider } from "styled-components";
import styled from "styled-components/native";

import {
  ContextMenuContext,
  contextMenuGatewayId,
  ContextMenuProvider,
} from "./components/context-menu";
import { GlobalLoading } from "./components/global-loading";
import { MachineProvider } from "./features/auth/machine/machine";
// import * as reactotron from "./reactotron";
import { initialize } from "./features/auth/store/effects";
import { selectInitializing } from "./features/auth/store/state";
import { ProfilesSubscription } from "./features/auth/subscriptions/profiles";
import { HouseholdCaresSubscription } from "./features/care/subscriptions/household-cares";
import { selectedSelectedOrMostRecentHouseholdId } from "./features/households/store/state";
import { CurrentProfileHouseholdsSubscription } from "./features/households/subscriptions/current-profile-households";
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

  useEffect(() => {
    initialize();
  }, []);

  const loading = fontsLoading || authInitializing;

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );

  return (
    <MachineProvider>
      <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
        <ContextMenuProvider>
          <GlobalErrorProvider loading={loading}>
            <GatewayProvider>
              <StatusBar
                barStyle={isDarkTheme ? darkTheme.type : lightTheme.type}
              />
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
                    <AppNavigation />
                  </>
                )}
              </AppWrapper>
              <ProfilesSubscription />
              <GlobalLoading />
              <GatewayDest
                name={contextMenuGatewayId}
                component={BottomSheetGatewayContainer}
              />
            </GatewayProvider>
          </GlobalErrorProvider>
        </ContextMenuProvider>
      </ThemeProvider>
    </MachineProvider>
  );
};

const BottomSheetGatewayContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { visibleMenuId: visible } = useContext(ContextMenuContext);

  const opacity = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(opacity.current, {
      toValue: visible ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: 0,
          height: "100%",
          width: "100%",
        },
        {
          opacity: opacity.current.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        },
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      {children}
    </Animated.View>
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
