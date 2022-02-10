import React from "react";
import { SafeAreaView } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../../theme";
import { ProgressBar } from "../progress-bar";
import { TouchableIcon } from "../touchable-icon";

export const ScreenLayout = ({
  stickyHeaderIndices,
  children,
  onBack,
  footer,
  headerRightButton,
  scrollView = true,
  progress,
  isRootScreen,
}: {
  stickyHeaderIndices?: number[];
  children: React.ReactNode;
  onBack?: () => void;
  footer?: React.ReactNode;
  headerRightButton?: React.ReactNode;
  scrollView?: boolean;
  progress?: number;
  isRootScreen?: boolean;
}) => {
  return (
    <Container>
      <AvoidingView>
        <InnerContainer isRootScreen={isRootScreen}>
          {onBack || headerRightButton ? (
            <ControlsContainer progress={progress}>
              <TouchableIcon
                onPress={onBack || (() => undefined)}
                icon="arrow-left"
                style={{ opacity: onBack ? 1 : 0 }}
              />
              {headerRightButton}
            </ControlsContainer>
          ) : null}
          {typeof progress === "number" ? (
            <ProgressBar progress={progress} />
          ) : null}
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

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(props) => props.theme.appBackground};
`;

const AvoidingView = styled.KeyboardAvoidingView`
  flex: 1;
`;

const InnerContainer = styled.View<{ isRootScreen: boolean }>`
  flex: 1;
  padding-bottom: ${(props) =>
    props.isRootScreen ? symbols.spacing.tabBarHeight : 0};
`;

const ControlsContainer = styled.View<{ progress?: number }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: ${symbols.spacing.appHorizontal};
  padding-vertical: ${symbols.spacing._8}px;
  margin-bottom: ${(props) =>
    typeof props.progress === "undefined" ? symbols.spacing._16 : 0}px;
`;

const ContentContainerScroll = styled.ScrollView`
  flex: 1;
`;

const ContentContainerView = styled.View`
  flex: 1;
`;
