import React from "react";
import styled from "styled-components/native";
import { symbols } from "../../theme";
import { TouchableIcon } from "../touchable-icon";
import { ScreenLayout } from "./screen-layout";
import { ProgressBar } from "../progress-bar";

export const BackableScreenLayout = ({
  stickyHeaderIndices,
  children,
  onBack,
  footer,
  headerRightButton,
  scrollView = true,
  progress,
}: {
  stickyHeaderIndices?: number[];
  children: React.ReactNode;
  onBack: () => void;
  footer?: React.ReactNode;
  headerRightButton?: React.ReactNode;
  scrollView?: boolean;
  progress?: number;
}) => {
  return (
    <ScreenLayout>
      <ControlsContainer>
        <BackButton onPress={onBack} icon="arrow-left" />
        {headerRightButton}
      </ControlsContainer>
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
    </ScreenLayout>
  );
};

const ControlsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: ${symbols.spacing.appHorizontal};
  padding-vertical: ${symbols.spacing._8}px;
`;

const BackButton = styled(TouchableIcon)``;

const ContentContainerScroll = styled.ScrollView`
  flex: 1;
`;

const ContentContainerView = styled.View`
  flex: 1;
`;
