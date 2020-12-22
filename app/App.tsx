import React, { useContext, useEffect } from "react";
import { ThemeProvider } from "styled-components";
import { darkTheme, lightTheme } from "./theme";
import styled from "styled-components/native";
import { useFonts } from "./hooks/fonts";
// import * as reactotron from "./reactotron";
import { initialize } from "./features/auth/store/effects";
import { ActivityIndicator, Animated, Easing, StatusBar } from "react-native";
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
import {
  ContextMenuContext,
  contextMenuGatewayId,
  ContextMenuProvider,
} from "./components/context-menu";
import { HouseholdPhotosSubscription } from "./features/plants/subscriptions/plant-photos";
import { GlobalLoading } from "./components/global-loading";
import { selectCurrentProfileThemeIsDark } from "./features/profiles/store/state";
import { AppNavigation } from "./navigation/navigation";
import { GatewayDest, GatewayProvider } from "@chardskarth/react-gateway";
import { useRef } from "react";

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
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );

  return (
    <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
      <ContextMenuProvider>
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
      </ContextMenuProvider>
    </ThemeProvider>
  );
};

const BottomSheetGatewayContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { visible } = useContext(ContextMenuContext);

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
