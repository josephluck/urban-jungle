import React from "react";
import styled from "styled-components/native";
import RNModal from "react-native-modal";

import { theme } from "../theme";
import { Heading } from "./typography";

export function Modal({
  title,
  children,
  isVisible,
  onClosePress,
  onClosed
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  isVisible: boolean;
  onClosePress: () => void;
  onClosed?: () => void;
}) {
  return (
    <RNModal
      isVisible={isVisible}
      backdropOpacity={0.6}
      backdropColor={theme.colors.offBlack}
      onSwipeComplete={onClosePress}
      onModalHide={onClosed}
      swipeDirection="down"
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
      onBackButtonPress={onClosePress}
      onBackdropPress={onClosePress}
      style={{ margin: 0, justifyContent: "flex-end" }}
      hideModalContentWhileAnimating
      hardwareAccelerated
    >
      <ModalContainer>
        <CloseBar />
        <ModalHeaderContainer>
          <ModalHeading>{title}</ModalHeading>
        </ModalHeaderContainer>
        {children}
      </ModalContainer>
    </RNModal>
  );
}

const ModalContainer = styled.View`
  background-color: ${props => props.theme.colors.deepGray};
  border-top-right-radius: ${props => props.theme.borderRadius.large};
  border-top-left-radius: ${props => props.theme.borderRadius.large};
`;

const CloseBar = styled.View`
  margin-top: ${props => props.theme.spacing._10};
  align-self: center;
  height: ${props => props.theme.size.closeBarHeight};
  width: ${props => props.theme.size.closeBarWidth};
  border-radius: ${props => props.theme.size.closeBarHeight};
  background-color: ${props => props.theme.colors.midOffGray};
`;

const ModalHeaderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing._18};
  padding-left: ${props => props.theme.spacing._18};
`;

const ModalHeading = styled(Heading)`
  flex: 1;
  padding-top: ${props => props.theme.spacing._12};
`;
