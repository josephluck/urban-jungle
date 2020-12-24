import React from "react";
import { Modal, ActivityIndicator } from "react-native";
import styled from "styled-components/native";

import { useStore } from "../store/state";
import { selectLoading } from "../store/ui";
import { symbols } from "../theme";

export const GlobalLoading = () => {
  const visible = useStore(selectLoading);

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={(...args) => console.log("onRequestClose", ...args)}
    >
      <Container>
        <ActivityIndicator size="large" color={symbols.colors.solidBlue} />
      </Container>
    </Modal>
  );
};

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background: ${symbols.colors.whiteTint05};
`;
