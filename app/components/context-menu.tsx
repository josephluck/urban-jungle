import { Feather } from "@expo/vector-icons";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { StyleProp, ViewProps } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { BottomDrawer } from "./bottom-drawer";
import { TouchableIcon } from "./touchable-icon";
import { SubHeading } from "./typography";

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
          key={button.icon}
          onPress={() => handleButtonPress(button.onPress)}
        >
          <ContextMenuButtonIcon name={button.icon} size={ICON_SIZE} />
          <SubHeading>{button.label}</SubHeading>
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
    <ContextButton
      style={style}
      onPress={handleShowContextMenu}
      icon="more-vertical"
    />
  );
};

const ContextButton = styled(TouchableIcon)`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;
