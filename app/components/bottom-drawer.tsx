import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { BackHandler, Dimensions, TouchableOpacity } from "react-native";
import Reanimated from "react-native-reanimated";
import {
  default as BottomSheet,
  default as BottomSheetBehavior,
} from "reanimated-bottom-sheet";
import styled, { ThemeProvider } from "styled-components/native";
import { lightTheme, symbols } from "../theme";
import { BodyText, Heading, SubHeading } from "./typography";

export const BottomDrawer = ({
  children,
  height = Dimensions.get("window").height * 0.8,
  onClose,
  visible,
}: {
  height?: number;
  onClose: () => void;
  visible: boolean;
  children: React.ReactNode;
}) => {
  const bottomSheetRef = useRef<BottomSheetBehavior>();

  const handleCloseEnd = useCallback(() => {
    onClose();
  }, [onClose]);

  const open = useCallback(() => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.snapTo(0);
    }
  }, []);

  const close = useCallback(() => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.snapTo(1);
    }
  }, []);

  const handleCloseIfVisible = useCallback(() => {
    if (visible) {
      close();
    }
  }, [visible, close]);

  useEffect(() => {
    if (bottomSheetRef.current) {
      if (visible) {
        open();
      } else {
        close();
      }
    }
  }, [visible, open, close]);

  const snapPoints = useMemo(() => [height, 0], [height]);

  /**
   * When the sheet is expanded and Android back button is pressed, close the
   * sheet and prevent the navigation
   */
  useEffect(() => {
    const handler = () => {
      if (visible) {
        close();
        return true; // NB: this prevents the event
      }
      return false; // NB: this propagates the event
    };
    BackHandler.addEventListener("hardwareBackPress", handler);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handler);
    };
  }, [close, visible]);

  /**
   * NB: represents how much of the underlying screen is visible as a number
   * between 0 and 1.
   * 0 represents the sheet is fully expanded (to full height),
   * 1 represents the sheet is fully closed.
   */
  const expansionProportion = useRef(new Reanimated.Value(1));

  return (
    <ThemeProvider theme={lightTheme}>
      <Overlay
        visible={visible}
        onPress={handleCloseIfVisible}
        expansionProportion={expansionProportion.current}
      />
      <BottomSheet
        callbackNode={expansionProportion.current}
        ref={bottomSheetRef as any}
        snapPoints={snapPoints}
        onCloseEnd={handleCloseEnd}
        enabledContentTapInteraction
        renderContent={() => (
          <BottomSheetWrapper style={{ height }}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={handleCloseIfVisible}
              activeOpacity={1}
            />
            <BottomSheetSafeArea>
              <BottomSheetContainer>{children}</BottomSheetContainer>
            </BottomSheetSafeArea>
          </BottomSheetWrapper>
        )}
      />
    </ThemeProvider>
  );
};

const BottomSheetWrapper = styled.View`
  justify-content: flex-end;
  flex-direction: column;
`;

const BottomSheetSafeArea = styled.SafeAreaView`
  background-color: ${symbols.colors.appBackground};
`;

const BottomSheetContainer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._16}px;
  ${Heading} {
    color: ${symbols.colors.nearBlack};
  }
  ${SubHeading} {
    color: ${symbols.colors.nearBlack};
  }
  ${BodyText} {
    color: ${symbols.colors.nearBlack};
  }
`;

/**
 * Backdrop overlay component used to darken the background screen when the user
 * drags the sheet up to full expansion.
 * NB: separate component required so that reanimated works with useRef hooks
 */
const Overlay = ({
  expansionProportion,
  onPress,
  visible,
}: {
  expansionProportion: Reanimated.Value<number>;
  onPress: () => void;
  visible: boolean;
}) => {
  const opacity = useRef(
    useExpansionInterpolation(expansionProportion, [0, 1])
  );
  return (
    <BackdropOverlay
      style={{
        opacity: opacity.current,
      }}
      pointerEvents={visible ? undefined : "none"}
    >
      <BackdropTouchableHandler onPress={onPress} />
    </BackdropOverlay>
  );
};

export const BackdropOverlay = styled(Reanimated.View as any)`
  background-color: ${symbols.colors.blackTint04};
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const BackdropTouchableHandler = styled(TouchableOpacity as any)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

/**
 * Custom hook that provides an easy way to create a Reanimated interpolation
 * based on the current expansion of the sheet and a given output range. Useful
 * for when interpolating styles between the closed and expanded as the user
 * drags the sheet in between closed and expanded.
 */
const useExpansionInterpolation = (
  /** The inverse of how much of the sheet has expanded */
  expansionProportion: Reanimated.Value<number>,
  /** The range to interpolate between i.e. 0 -> 1 for opacity */
  outputRange: Reanimated.Adaptable<number>[]
) => {
  const invertedExpansionProportion = useRef(
    Reanimated.sub(1, expansionProportion)
  );

  return Reanimated.interpolate(invertedExpansionProportion.current, {
    inputRange: [0, 1],
    outputRange,
    extrapolate: Reanimated.Extrapolate.CLAMP,
  });
};
