import { Gateway } from "@chardskarth/react-gateway";
import { Feather } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { useEffect } from "react";
import { StyleProp, View, ViewProps, TouchableOpacity } from "react-native";
import styled from "styled-components/native";

import { navigationDidNavigateBeacon } from "../navigation/navigation";
import { symbols } from "../theme";
import { BottomDrawer } from "./bottom-drawer";
import { TouchableIcon } from "./touchable-icon";
import { SubHeading } from "./typography";

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

export const useContextMenu = () => useContext(ContextMenuContext);

export const ContextMenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);

  useEffect(() => {
    const unsubscribe = navigationDidNavigateBeacon.subscribe(hide);
    return unsubscribe;
  }, [hide]);

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
  children: React.ReactNode;
  icon?: string;
  onPress: () => void;
};

export const ContextMenuDotsButton = ({
  style,
  children,
}: {
  style?: StyleProp<ViewProps>;
  children: React.ReactNode[];
}) => {
  const { visible, show, hide } = useContext(ContextMenuContext);

  const height = useMemo(
    () => BUTTON_MARGIN * 2 + children.length * BUTTON_HEIGHT,
    [children.length],
  );

  return (
    <>
      <ContextButton style={style} onPress={show} icon="more-vertical" />
      <Gateway into={contextMenuGatewayId}>
        <BottomDrawer height={height} onClose={hide} visible={visible}>
          {children}
        </BottomDrawer>
      </Gateway>
    </>
  );
};

export const ContextMenuIconButton = ({
  onPress,
  icon,
  children,
}: ContextMenuButtonType) => (
  <ContextMenuButtonItem onPress={onPress}>
    {icon ? (
      <ContextMenuButtonIcon name={icon} size={ICON_SIZE} />
    ) : (
      <View style={{ width: ICON_SIZE, height: ICON_SIZE }} />
    )}
    <ContextMenuSubHeading>{children}</ContextMenuSubHeading>
  </ContextMenuButtonItem>
);

export const ContextMenuTouchable = ({
  children,
  buttons,
}: {
  children: React.ReactNode;
  buttons: React.ReactNode[];
}) => {
  const { hide, show, visible } = useContext(ContextMenuContext);

  const height = useMemo(
    () => BUTTON_MARGIN * 2 + buttons.length * BUTTON_HEIGHT,
    [buttons.length],
  );

  const isFocused = useIsFocused();

  return (
    <>
      <TouchableOpacity onPress={show}>{children}</TouchableOpacity>
      <Gateway into={contextMenuGatewayId}>
        <BottomDrawer
          height={height}
          onClose={hide}
          visible={visible && isFocused}
        >
          {buttons}
        </BottomDrawer>
      </Gateway>
    </>
  );
};

const ContextButton = styled(TouchableIcon)`
  padding-left: ${symbols.spacing.appHorizontal}px;
`;
