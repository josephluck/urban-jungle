import { Gateway } from "@chardskarth/react-gateway";
import { Feather } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Keyboard, StyleProp, View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";
import { navigationDidNavigateBeacon } from "../navigation/beacon";
import { symbols } from "../theme";
import { BottomDrawer } from "./bottom-drawer";
import { TouchableIcon } from "./touchable-icon";
import { TouchableOpacity } from "./touchable-opacity";
import { SubHeading } from "./typography";

export const contextMenuGatewayId = "GATEWAY_CONTEXT_MENU";

type ContextMenuContextType = {
  visibleMenuId?: string;
  show: (menuId: string) => void;
  hide: () => void;
  setVisibleMenuId: (visibleMenuId: string) => void;
};

export const ContextMenuContext = React.createContext<ContextMenuContextType>({
  visibleMenuId: undefined,
  show: () => void null,
  hide: () => void null,
  setVisibleMenuId: () => void null,
});

export const useContextMenu = () => useContext(ContextMenuContext);

export const ContextMenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visibleMenuId, setVisibleMenuId] = useState<string>();
  const show = useCallback((menuId: string) => {
    setVisibleMenuId(menuId);
    Keyboard.dismiss();
  }, []);
  const hide = useCallback(() => setVisibleMenuId(undefined), []);

  useEffect(() => {
    const unsubscribe = navigationDidNavigateBeacon.subscribe(hide);
    return () => {
      unsubscribe();
    };
  }, [hide]);

  return (
    <ContextMenuContext.Provider
      value={{ show, hide, visibleMenuId, setVisibleMenuId }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
};

// TODO: tweak this..
const ICON_SIZE = 28;
const BUTTON_MARGIN = symbols.spacing._16;
const BUTTON_HEIGHT = ICON_SIZE + BUTTON_MARGIN * 2;

const ContextMenuButtonItem = styled(TouchableOpacity)`
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

export const ContextMenuDotsButton = ({
  style,
  children,
  menuId,
}: {
  style?: StyleProp<ViewProps>;
  children: React.ReactNode[];
  menuId: string;
}) => {
  const { visibleMenuId: visibleMenuId, show, hide } = useContext(
    ContextMenuContext,
  );

  const { bottom } = useSafeAreaInsets();

  const handleShow = useCallback(() => {
    show(menuId);
  }, [show, menuId]);

  const height = useMemo(
    () => bottom + (BUTTON_MARGIN * 2 + children.length * BUTTON_HEIGHT),
    [children.length, bottom],
  );

  const isFocused = useIsFocused();
  const visible = visibleMenuId === menuId && isFocused;

  return (
    <>
      <ContextButton style={style} onPress={handleShow} icon="more-vertical" />
      <Gateway into={contextMenuGatewayId}>
        {visible ? (
          <BottomDrawer height={height} onClose={hide} visible={visible}>
            {children}
          </BottomDrawer>
        ) : null}
      </Gateway>
    </>
  );
};

export const ContextMenuTouchable = ({
  children,
  buttons,
  menuId,
}: {
  children: React.ReactNode;
  buttons: React.ReactNode[];
  menuId: string;
}) => {
  const { hide, show, visibleMenuId } = useContext(ContextMenuContext);
  const isFocused = useIsFocused();

  const { bottom } = useSafeAreaInsets();

  const height = useMemo(
    () => bottom + (BUTTON_MARGIN * 2 + buttons.length * BUTTON_HEIGHT),
    [buttons.length, bottom],
  );

  const handleShow = useCallback(() => {
    show(menuId);
  }, [show, menuId]);

  const visible = visibleMenuId === menuId && isFocused;

  return (
    <>
      <TouchableOpacity onPress={handleShow}>{children}</TouchableOpacity>
      <Gateway into={contextMenuGatewayId}>
        {visible ? (
          <BottomDrawer height={height} onClose={hide} visible={visible}>
            {buttons}
          </BottomDrawer>
        ) : null}
      </Gateway>
    </>
  );
};

const ContextButton = styled(TouchableIcon)`
  padding-left: ${symbols.spacing.appHorizontal}px;
`;
