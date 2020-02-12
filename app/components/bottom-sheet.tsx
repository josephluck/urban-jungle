import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from "react";
import {
  BackHandler,
  StatusBar as RNStatusBar,
  Dimensions
} from "react-native";
import Reanimated from "react-native-reanimated";
import Sheet from "reanimated-bottom-sheet";
import styled from "styled-components/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { symbols, useTheme } from "../theme";
import { faTimes } from "@fortawesome/pro-light-svg-icons";

const FULL_HEIGHT = Dimensions.get("window").height;
const STATUS_BAR_HEIGHT = 25; // TODO
const isAndroid = false; // TODO

export interface Props {
  children?: React.ReactNode;
  header?: React.ReactNode;
  onOpened?: () => void;
  onClosed?: () => void;
  onCloseStarted?: () => void;
  collapsedHeight?: number;
  intermediateSnapPointHeight?: number;
  /**
   * NB: if you wish to allow dragging the inner content as well as the header,
   * set this to true.
   * Note that setting this to true will prevent scrolling of any internal
   * FlatList or ScrollView on Android.
   */
  enabledContentGestureInteraction?: boolean;
}

export interface BottomSheetRef {
  expand: (snapPointIndex?: number) => void;
  close: () => void;
}

export const BottomSheet = forwardRef<BottomSheetRef, Props>(
  (
    {
      children,
      header,
      onOpened,
      onClosed,
      onCloseStarted,
      collapsedHeight = 0,
      intermediateSnapPointHeight,
      enabledContentGestureInteraction = false
    },
    ref
  ) => {
    const theme = useTheme();
    const isExpanded = useRef(false);
    const sheetRef = useRef<Sheet>(null);

    const snapPoints = useMemo(
      () =>
        intermediateSnapPointHeight
          ? [collapsedHeight, intermediateSnapPointHeight, FULL_HEIGHT]
          : [collapsedHeight, FULL_HEIGHT],
      [collapsedHeight, intermediateSnapPointHeight]
    );

    const expand = useCallback(
      (snapPointIndex: number = snapPoints.length - 1) => {
        if (sheetRef.current) {
          sheetRef.current.snapTo(snapPointIndex);
        }
      },
      [sheetRef.current, snapPoints.length]
    );

    const close = useCallback(() => {
      if (sheetRef.current) {
        sheetRef.current.snapTo(0);
      }
    }, [sheetRef.current]);

    const handleOpened = useCallback(() => {
      isExpanded.current = true;
      if (!isAndroid) {
        RNStatusBar.setBarStyle("dark-content", true);
      }
      if (onOpened) {
        onOpened();
      }
    }, [onOpened]);

    const handleClosed = useCallback(() => {
      isExpanded.current = false;
      if (!isAndroid) {
        RNStatusBar.setBarStyle(theme.type, false);
      }
      if (onClosed) {
        onClosed();
      }
    }, [onClosed]);

    const handleCloseStarted = useCallback(() => {
      if (onCloseStarted) {
        onCloseStarted();
      }
    }, [onCloseStarted]);

    /**
     * Exposes methods to the parent (for external imperative control)
     */
    useImperativeHandle(ref, () => ({
      expand,
      close
    }));

    /**
     * When the sheet is expanded and Android back button is pressed, close the
     * sheet and prevent the navigation
     */
    useEffect(() => {
      const handler = () => {
        if (isExpanded.current) {
          close();
          return true;
        }
        return false;
      };
      BackHandler.addEventListener("hardwareBackPress", handler);
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", handler);
      };
    }, [close, isExpanded.current]);

    /**
     * NB: represents how much of the underlying screen is visible as a number
     * between 0 and 1.
     * 0 represents the sheet is fully expanded (to full height),
     * 1 represents the sheet is fully closed.
     */
    const expansionProportion = useRef(new Reanimated.Value(1));

    const renderHeader = useCallback(
      () => (
        <HeaderContainer>
          <HeaderTopBar
            expansionProportion={expansionProportion.current}
            intermediateSnapPointHeight={intermediateSnapPointHeight}
          />
          <HeaderInnerContainer>
            <HeaderCloseIconContainer>
              <CloseButton
                expansionProportion={expansionProportion.current}
                intermediateSnapPointHeight={intermediateSnapPointHeight}
                onPress={close}
              />
            </HeaderCloseIconContainer>
            {header}
          </HeaderInnerContainer>
        </HeaderContainer>
      ),
      [header, close, expansionProportion.current, intermediateSnapPointHeight]
    );

    const renderContent = useCallback(
      () => (
        <ContentContainer>
          <ContentInner>{children}</ContentInner>
        </ContentContainer>
      ),
      [children]
    );

    return (
      <>
        <Sheet
          ref={sheetRef}
          snapPoints={snapPoints}
          initialSnap={0}
          renderContent={children ? renderContent : undefined}
          renderHeader={header ? renderHeader : undefined}
          onOpenEnd={handleOpened}
          onCloseEnd={handleClosed}
          onCloseStart={handleCloseStarted}
          enabledContentGestureInteraction={enabledContentGestureInteraction}
          callbackNode={expansionProportion.current}
        />
        <Overlay
          expansionProportion={expansionProportion.current}
          intermediateSnapPointHeight={intermediateSnapPointHeight}
        />
      </>
    );
  }
);

/**
 * Backdrop overlay component used to darken the background screen when the user
 * drags the sheet up to full expansion.
 * NB: separate component required so that reanimated works with useRef hooks
 */
const Overlay = ({
  expansionProportion,
  intermediateSnapPointHeight = 0
}: {
  expansionProportion: Reanimated.Value<number>;
  intermediateSnapPointHeight?: number;
}) => {
  const opacity = useRef(
    useExpansionInterpolation(
      expansionProportion,
      [0, 1],
      intermediateSnapPointHeight
    )
  );
  return (
    <BackdropOverlay
      style={{
        opacity: opacity.current
      }}
      pointerEvents="none"
    />
  );
};

/**
 * Header top bar that comprises the border top-left and top-right radius and
 * the top shadow (on iOS only, as Android does not support directional shadow).
 * Border radius and shadow interpolate to 0 values as user drags the sheet to
 * full expansion.
 * NB: separate component required so that reanimated works with useRef hooks
 */
const HeaderTopBar = ({
  expansionProportion,
  intermediateSnapPointHeight = 0
}: {
  expansionProportion: Reanimated.Value<number>;
  intermediateSnapPointHeight?: number;
}) => {
  const borderRadius = useRef(
    useExpansionInterpolation(
      expansionProportion,
      [symbols.borderRadius.large, 0],
      intermediateSnapPointHeight
    )
  );
  const shadowOpacity = useRef(
    useExpansionInterpolation(
      expansionProportion,
      [0.2, 0],
      intermediateSnapPointHeight
    )
  );

  /**
   * The height of this element on Android needs to expand as the user expands
   * the sheet to account for the height of the status bar. If this isn't done
   * then the spacing between the status bar and the top of the sheet is not
   * correct (the status bar overlaps the top of the sheet's header).
   * NB: defaultHeight is derived from the handle's height + vertical margins
   */
  const defaultHeight =
    symbols.spacing._8 * 2 + symbols.size.bottomSheetHandleHeight;
  const expandedHeight = isAndroid
    ? defaultHeight + STATUS_BAR_HEIGHT
    : defaultHeight;

  const height = useRef(
    useExpansionInterpolation(
      expansionProportion,
      [defaultHeight, expandedHeight],
      intermediateSnapPointHeight
    )
  );

  return (
    <HeaderRadius
      style={{
        borderTopLeftRadius: borderRadius.current,
        borderTopRightRadius: borderRadius.current,
        shadowOpacity: shadowOpacity.current,
        height: height.current
      }}
    >
      <ExpandHandle />
    </HeaderRadius>
  );
};

/**
 * Sheet close icon that interpolates in opacity when the user drags the sheet
 * to full expansion.
 * NB: separate component required so that reanimated works with useRef hooks
 */
const CloseButton = ({
  expansionProportion,
  onPress,
  intermediateSnapPointHeight = 0
}: {
  expansionProportion: Reanimated.Value<number>;
  onPress: () => void;
  intermediateSnapPointHeight?: number;
}) => {
  const theme = useTheme();
  const opacity = useRef(
    useExpansionInterpolation(
      expansionProportion,
      [0, 1],
      intermediateSnapPointHeight
    )
  );

  return (
    <Reanimated.View style={{ opacity: opacity.current }}>
      <ModalCloseButtonWrapper onPress={onPress}>
        <AddIconWrapper>
          <FontAwesomeIcon
            color={theme.bottomSheetCloseButton}
            icon={faTimes}
            size={20}
          />
        </AddIconWrapper>
      </ModalCloseButtonWrapper>
    </Reanimated.View>
  );
};

/**
 * Custom hook that provides an easy way to create a Reanimated interpolation
 * based on the current expansion of the sheet and a given output range. Useful
 * for when interpolating styles between the closed and expanded as the user
 * drags the sheet in between closed and expanded.
 * NB: the returned interpolation only takes affect from the intermediate snap
 * point height to the full height. If a intermediate snap point is not provided
 * then the interpolation takes affect from full closed to fully expanded.
 */
const useExpansionInterpolation = (
  /** The inverse of how much of the sheet has expanded */
  expansionProportion: Reanimated.Value<number>,
  /** The range to interpolate between i.e. 0 -> 1 for opacity */
  outputRange: Reanimated.Adaptable<number>[],
  /** The intermediate snap point height */
  intermediateSnapPointHeight: number
) => {
  /**
   * NB: Represents the value at which to start interpolating the opacity from
   * which is the intermediate stop point to the full-height as a proportional
   * value between 0 and 1 (if intermediate stop point height is provided).
   */
  const intermediateSnapPointHeightProportion = intermediateSnapPointHeight
    ? intermediateSnapPointHeight / FULL_HEIGHT
    : 0;

  const invertedExpansionProportion = useRef(
    Reanimated.sub(1, expansionProportion)
  );

  return Reanimated.interpolate(invertedExpansionProportion.current, {
    inputRange: [intermediateSnapPointHeightProportion, 1],
    outputRange,
    extrapolate: Reanimated.Extrapolate.CLAMP
  });
};

const ModalCloseButtonWrapper = styled.TouchableOpacity`
  padding-vertical: ${symbols.spacing._16};
  padding-horizontal: ${symbols.spacing._16};
  justify-content: center;
  align-items: center;
`;

const AddIconWrapper = styled.View`
  width: ${symbols.size.avatarSmall};
  height: ${symbols.size.avatarSmall};
  justify-content: center;
  align-items: center;
`;

export const BOTTOM_SHEET_ANDROID_SHADOW_OFFSET = 20;

export const HeaderContainer = styled.SafeAreaView`
  border-top-left-radius: ${symbols.borderRadius.large};
  border-top-right-radius: ${symbols.borderRadius.large};
  background-color: ${props => props.theme.bottomSheetBackground};
`;

/**
 * This component is separated as a bar so that it can be animated
 * via gesture.
 *
 * NB: no shadow on Android since it's not possible to add a negative top
 * shadow without resorting to hacky solutions.
 */
export const HeaderRadius = styled(Reanimated.View as any)`
  justify-content: flex-end;
  border-top-left-radius: ${symbols.borderRadius.large};
  border-top-right-radius: ${symbols.borderRadius.large};
  background-color: ${props => props.theme.bottomSheetBackground};
`;

export const HeaderInnerContainer = styled.View`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.bottomSheetBackground};
`;

export const ExpandHandle = styled.View`
  align-self: center;
  width: ${symbols.size.bottomSheetHandleWidth};
  height: ${symbols.size.bottomSheetHandleHeight};
  border-radius: ${symbols.size.bottomSheetHandleHeight / 2};
  background-color: ${props => props.theme.bottomSheetExpander};
  margin-vertical: ${symbols.spacing._8};
`;

export const HeaderCloseIconContainer = styled.View`
  position: absolute;
  top: -20;
  right: -10;
`;

export const ContentContainer = styled(Reanimated.View as any)`
  background-color: ${props => props.theme.bottomSheetBackground};
  height: 100%;
`;

export const ContentInner = styled.SafeAreaView`
  flex: 1;
`;

export const BackdropOverlay = styled(Reanimated.View as any)`
  background-color: ${props => props.theme.bottomSheetBackdrop};
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

/** NB: For Android only */
export const ShadowContainer = styled(Reanimated.View as any)`
  height: ${BOTTOM_SHEET_ANDROID_SHADOW_OFFSET};
  border-radius: ${symbols.borderRadius.large};
  position: absolute;
  top: -${symbols.spacing._10};
  left: 0;
  right: 0;
`;
