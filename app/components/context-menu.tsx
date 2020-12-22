import { Feather } from "@expo/vector-icons";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { StyleProp, View, ViewProps, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { BottomDrawer } from "./bottom-drawer";
import { TouchableIcon } from "./touchable-icon";
import { SubHeading } from "./typography";

type ContextMenuButtonType = {
  label: string;
  icon?: string;
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

  const height = useMemo(
    () => BUTTON_MARGIN * 2 + buttons.length * BUTTON_HEIGHT,
    [buttons.length]
  );

  const handleClose = useCallback(() => setVisible(false), [setVisible]);

  const handleButtonPress = useCallback(
    (callback: () => void) => {
      handleClose(); // TODO: maybe this should use a forwarded imperative handle?
      callback();
    },
    [handleClose]
  );

  return (
    <BottomDrawer height={height} onClose={handleClose} visible={visible}>
      {buttons.map((button) => (
        <ContextMenuButtonItem
          key={button.label}
          onPress={() => handleButtonPress(button.onPress)}
        >
          {button.icon ? (
            <ContextMenuButtonIcon name={button.icon} size={ICON_SIZE} />
          ) : (
            <View style={{ width: ICON_SIZE, height: ICON_SIZE }} />
          )}
          <ContextMenuSubHeading>{button.label}</ContextMenuSubHeading>
        </ContextMenuButtonItem>
      ))}
    </BottomDrawer>
  );
};

// TODO: tweak this..
const ICON_SIZE = 28;
const BUTTON_MARGIN = symbols.spacing._16;
const BUTTON_HEIGHT = ICON_SIZE + BUTTON_MARGIN * 2;

const ContextMenuButtonItem = styled(TouchableOpacity as any)`
  flex-direction: row;
  align-items: center;
  height: ${BUTTON_HEIGHT}px;
`;

const ContextMenuButtonIcon = styled(Feather)``;

const ContextMenuSubHeading = styled(SubHeading)`
  margin-left: ${symbols.spacing._12}px;
  color: ${symbols.colors.offBlack};
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
    <ContextButton
      style={style}
      onPress={handleShowContextMenu}
      icon="more-vertical"
    />
  );
};

export const ContextMenuTouchable = ({
  buttons,
  children,
}: {
  buttons: ContextMenuButtonType[];
  children: React.ReactNode;
}) => {
  const { setVisible, setButtons } = useContext(ContextMenuContext);

  const handleShowContextMenu = useCallback(() => {
    setButtons(buttons);
    setVisible(true);
  }, [setVisible, setButtons]);

  return (
    <TouchableOpacity onPress={handleShowContextMenu}>
      {children}
    </TouchableOpacity>
  );
};

const ContextButton = styled(TouchableIcon)`
  padding-left: ${symbols.spacing.appHorizontal}px;
`;
