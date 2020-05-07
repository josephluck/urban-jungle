import React, { useCallback, useContext, useMemo, useState } from "react";
import { StyleProp, ViewProps, BackHandler } from "react-native";
import { TouchableIcon } from "./touchable-icon";
import BottomSheet from "reanimated-bottom-sheet";
import { useRef } from "react";
import BottomSheetBehavior from "reanimated-bottom-sheet";
import { useEffect } from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { SubHeading } from "./typography";
import Reanimated from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";

type ContextMenuButtonType = {
  label: string;
  icon: string;
  onPress: () => void;
};

type ContextMenuContextType = {
  visible: boolean;
  buttons: ContextMenuButtonType[];
  setVisible: (visible: boolean) => void;
  setButtons: (buttons: ContextMenuButtonType[]) => void;
};

export const ContextMenuContext = React.createContext<ContextMenuContextType>({
  visible: false,
  buttons: [],
  setVisible: () => void null,
  setButtons: () => void null,
});

export const ContextMenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [buttons, setButtons] = useState<ContextMenuButtonType[]>([]);

  return (
    <ContextMenuContext.Provider
      value={{ visible, setVisible, buttons, setButtons }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
};

export const ContextMenu = () => {
  const { visible, setVisible, buttons } = useContext(ContextMenuContext);
  const bottomSheetRef = useRef<BottomSheetBehavior>();

  const handleCloseEnd = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

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

  const snapPoints = useMemo(
    () => [BUTTON_MARGIN * 2 + buttons.length * BUTTON_HEIGHT, 0],
    [buttons.length]
  );

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

  const handleButtonPress = useCallback(
    (callback: () => void) => {
      close();
      callback();
    },
    [close]
  );

  return (
    <>
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
          <BottomSheetContainer>
            {buttons.map((button) => (
              <ContextMenuButtonItem
                key={button.icon}
                onPress={() => handleButtonPress(button.onPress)}
              >
                <ContextMenuButtonIcon name={button.icon} size={ICON_SIZE} />
                <SubHeading>{button.label}</SubHeading>
              </ContextMenuButtonItem>
            ))}
          </BottomSheetContainer>
        )}
      />
    </>
  );
};

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

// TODO: tweak this..
const ICON_SIZE = 28;
const BUTTON_MARGIN = symbols.spacing._16;
const BUTTON_HEIGHT = ICON_SIZE + BUTTON_MARGIN * 2;

const BottomSheetContainer = styled.View`
  background-color: ${symbols.colors.appBackground};
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${BUTTON_MARGIN}px;
`;

const ContextMenuButtonItem = styled(TouchableOpacity as any)`
  flex-direction: row;
  align-items: center;
  height: ${BUTTON_HEIGHT}px;
`;
const ContextMenuButtonIcon = styled(Feather)`
  margin-right: ${symbols.spacing._12}px;
`;

export const ContextMenuButton = ({
  style,
  buttons,
}: {
  style?: StyleProp<ViewProps>;
  buttons: ContextMenuButtonType[];
}) => {
  const { setVisible, setButtons } = useContext(ContextMenuContext);

  const handleShowContextMenu = useCallback(() => {
    setButtons(buttons);
    setVisible(true);
  }, [setVisible, setButtons]);

  return (
    <TouchableIcon
      style={style}
      onPress={handleShowContextMenu}
      icon="more-vertical"
    />
  );
};

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
