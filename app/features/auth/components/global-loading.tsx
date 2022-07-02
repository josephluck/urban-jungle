import React from "react";
import { ActivityIndicator, Modal } from "react-native";
import styled, { useTheme } from "styled-components/native";
import { useStore } from "../../../store/state";
import { selectLoading } from "../../../store/ui";

export const GlobalLoading = ({
  forceVisible,
  solid,
}: {
  forceVisible: boolean;
  solid?: boolean;
}) => {
  const visible = useStore(selectLoading) || forceVisible;
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      animationType={solid ? "none" : undefined}
      transparent
      onRequestClose={(...args) => console.log("onRequestClose", ...args)}
    >
      <Container solid={solid}>
        <ActivityIndicator size="large" color={theme.loadingIndicator} />
      </Container>
    </Modal>
  );
};

const Container = styled.View<{ solid?: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.solid
      ? props.theme.loadingOverlayBackgroundSolid
      : props.theme.loadingOverlayBackground};
`;
