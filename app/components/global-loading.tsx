import React from "react";
import { ActivityIndicator, Modal } from "react-native";
import styled, { useTheme } from "styled-components/native";
import { useStore } from "../store/state";
import { selectLoading } from "../store/ui";

export const GlobalLoading = () => {
  const visible = useStore(selectLoading);
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={(...args) => console.log("onRequestClose", ...args)}
    >
      <Container>
        <ActivityIndicator size="large" color={theme.loadingIndicator} />
      </Container>
    </Modal>
  );
};

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.loadingOverlayBackground};
`;
