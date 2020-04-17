import React from "react";
import styled from "styled-components/native";
import { View, Platform, StatusBar } from "react-native";

export const ScreenLayout = ({ children }: { children: React.ReactNode }) => (
  <Container>
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {children}
    </View>
  </Container>
);

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.appBackground};
`;
