import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native";
import styled from "styled-components/native";
import { symbols } from "../../theme";
import { ProgressBar } from "../progress-bar";

export const ScreenLayout = ({
  stickyHeaderIndices,
  children,
  footer,
  scrollView = true,
  progress,
  isRootScreen,
  isModal,
}: {
  stickyHeaderIndices?: number[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerRightButton?: React.ReactNode;
  scrollView?: boolean;
  progress?: number;
  isRootScreen?: boolean;
  isModal?: boolean;
}) => {
  return (
    <Container isModal={isModal}>
      <AvoidingView
        behavior={Platform.select({ ios: "padding", android: "height" })}
      >
        {typeof progress === "number" ? (
          <View style={{ marginTop: symbols.spacing._16 }}>
            <ProgressBar progress={progress} />
          </View>
        ) : null}
        <InnerContainer isRootScreen={isRootScreen}>
          {scrollView ? (
            <ContentContainerScroll stickyHeaderIndices={stickyHeaderIndices}>
              {children}
            </ContentContainerScroll>
          ) : (
            <ContentContainerView>{children}</ContentContainerView>
          )}
          {footer}
        </InnerContainer>
      </AvoidingView>
    </Container>
  );
};

const Container = styled(SafeAreaView)<{ isModal: boolean }>`
  flex: 1;
  background-color: ${(props) =>
    props.isModal ? props.theme.modalBackground : props.theme.appBackground};
`;

const AvoidingView = styled(KeyboardAvoidingView)`
  flex: 1;
`;

const InnerContainer = styled.View<{ isRootScreen: boolean }>`
  flex: 1;
  padding-top: ${(props) =>
    props.isRootScreen ? 0 : symbols.spacing.appVertical}px;
`;

const ContentContainerScroll = styled.ScrollView`
  flex: 1;
`;

const ContentContainerView = styled.View`
  flex: 1;
`;

export const ContentContainer = styled.View`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;

export const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;
