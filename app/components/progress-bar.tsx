import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";

export const ProgressBar = ({ progress }: { progress: number }) => (
  <ProgressContainer>
    <ProgressPercentage
      style={{ width: `${progress}%` }}
      withRadius={progress < 100}
    ></ProgressPercentage>
  </ProgressContainer>
);

const ProgressContainer = styled.View`
  height: 4px;
  width: 100%;
  background-color: ${symbols.colors.nearWhite};
`;

const ProgressPercentage = styled.View<{ withRadius: boolean }>`
  height: 4px;
  background-color: ${symbols.colors.deepGray};
  border-top-right-radius: ${(props) => (props.withRadius ? "2px" : 0)};
  border-bottom-right-radius: ${(props) => (props.withRadius ? "2px" : 0)};
`;
