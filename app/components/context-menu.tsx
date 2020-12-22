import { Feather } from "@expo/vector-icons";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { StyleProp, View, ViewProps, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { BottomDrawer } from "./bottom-drawer";
import { TouchableIcon } from "./touchable-icon";
import { SubHeading } from "./typography";
import { Gateway } from "@chardskarth/react-gateway";

export const contextMenuGatewayId = "GATEWAY_CONTEXT_MENU";

type ContextMenuContextType = {
  visible: boolean;
  show: () => void;
  hide: () => void;
  setVisible: (visible: boolean) => void;
};

export const ContextMenuContext = React.createContext<ContextMenuContextType>({
  visible: false,
  show: () => void null,
  hide: () => void null,
  setVisible: () => void null,
});

export const ContextMenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);

  return (
    <ContextMenuContext.Provider value={{ show, hide, visible, setVisible }}>
      {children}
    </ContextMenuContext.Provider>
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

type ContextMenuButtonType = {
  label: string;
  icon?: string;
  onPress: () => void;
};

export const ContextMenuButton = ({
  style,
  buttons = [],
  children,
}: {
  style?: StyleProp<ViewProps>;
  buttons?: ContextMenuButtonType[];
  children?: React.ReactNode;
}) => {
  const { visible, show, hide } = useContext(ContextMenuContext);

  const height = useMemo(
    () => BUTTON_MARGIN * 2 + buttons.length * BUTTON_HEIGHT,
    [buttons.length]
  );

  const handleButtonPress = useCallback(
    (callback: () => void) => {
      hide();
      callback();
    },
    [hide]
  );

  return (
    <>
      <ContextButton style={style} onPress={show} icon="more-vertical" />
      <Gateway into={contextMenuGatewayId}>
        <BottomDrawer height={height} onClose={hide} visible={visible}>
          {children ||
            buttons.map((button) => (
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
      </Gateway>
    </>
  );
};

export const ContextMenuTouchable = ({
  buttons,
  children,
}: {
  buttons: ContextMenuButtonType[];
  children: React.ReactNode;
}) => {
  const { hide, show, visible } = useContext(ContextMenuContext);

  const height = useMemo(
    () => BUTTON_MARGIN * 2 + buttons.length * BUTTON_HEIGHT,
    [buttons.length]
  );

  const handleButtonPress = useCallback(
    (callback: () => void) => {
      hide(); // TODO: maybe this should use a forwarded imperative handle?
      callback();
    },
    [hide]
  );

  return (
    <>
      <TouchableOpacity onPress={show}>{children}</TouchableOpacity>
      <Gateway into={contextMenuGatewayId}>
        <BottomDrawer height={height} onClose={hide} visible={visible}>
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
      </Gateway>
    </>
  );
};

const ContextButton = styled(TouchableIcon)`
  padding-left: ${symbols.spacing.appHorizontal}px;
`;
