import React from "react";
import styled from "styled-components/native";
import { symbols } from "../../theme";
import { TouchableIcon } from "../touchable-icon";
import { ScreenLayout } from "./screen-layout";

export const BackableScreenLayout = ({
  stickyHeaderIndices,
  children,
  onBack,
  headerRightIcon = "more-vertical",
  headerRightOnPress,
  footer,
}: {
  stickyHeaderIndices?: number[];
  children: React.ReactNode;
  onBack: () => void;
  headerRightIcon?: string;
  headerRightOnPress?: () => void;
  footer?: React.ReactNode;
}) => (
  <ScreenLayout>
    <HeaderContainer>
      <ControlsContainer>
        <TouchableIcon onPress={onBack} icon="arrow-left" />
        {headerRightIcon && headerRightOnPress ? (
          <TouchableIcon onPress={headerRightOnPress} icon={headerRightIcon} />
        ) : null}
      </ControlsContainer>
    </HeaderContainer>
    <ContentContainer stickyHeaderIndices={stickyHeaderIndices}>
      {children}
    </ContentContainer>
    {footer}
  </ScreenLayout>
);

const HeaderContainer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  margin-vertical: ${symbols.spacing._20}px;
`;

const ControlsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ContentContainer = styled.ScrollView`
  flex: 1;
`;
