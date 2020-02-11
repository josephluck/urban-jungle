import React from "react";
import styled from "styled-components/native";
import { SafeAreaView, Platform, StatusBar } from "react-native";

export const ScreenLayout = ({ children }: { children: React.ReactNode }) => (
  <Container>
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
      }}
    >
      {children}
    </SafeAreaView>
  </Container>
);

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.appBackground};
`;
