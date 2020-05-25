import React from "react";
import styled from "styled-components/native";
import { symbols } from "../../theme";
import { TouchableIcon } from "../touchable-icon";
import { ScreenLayout } from "./screen-layout";

export const BackableScreenLayout = ({
  stickyHeaderIndices,
  children,
  onBack,
  footer,
  headerRightButton,
  scrollView = true,
}: {
  stickyHeaderIndices?: number[];
  children: React.ReactNode;
  onBack: () => void;
  footer?: React.ReactNode;
  headerRightButton?: React.ReactNode;
  scrollView?: boolean;
}) => {
  return (
    <ScreenLayout>
      <ControlsContainer>
        <BackButton onPress={onBack} icon="arrow-left" />
        {headerRightButton}
      </ControlsContainer>
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
`;

const BackButton = styled(TouchableIcon)`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;

const ContentContainerScroll = styled.ScrollView`
  flex: 1;
`;

const ContentContainerView = styled.View`
  flex: 1;
`;
