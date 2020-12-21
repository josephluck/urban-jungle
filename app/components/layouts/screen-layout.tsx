import React from "react";
import styled from "styled-components/native";
import { symbols } from "../../theme";

export const ScreenLayout = ({
  children,
  isRootScreen = false,
}: {
  children: React.ReactNode;
  isRootScreen?: boolean;
}) => (
  <Container>
    <InnerContainer isRootScreen={isRootScreen}>{children}</InnerContainer>
  </Container>
);

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props) => props.theme.appBackground};
`;

const InnerContainer = styled.View<{ isRootScreen: boolean }>`
  flex: 1;
  padding-bottom: ${(props) =>
    props.isRootScreen ? symbols.spacing.tabBarHeight : 0};
`;
