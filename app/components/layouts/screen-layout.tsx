import React from "react";
import styled from "styled-components/native";

export const ScreenLayout = ({ children }: { children: React.ReactNode }) => (
  <Container>{children}</Container>
);

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props) => props.theme.appBackground};
`;
