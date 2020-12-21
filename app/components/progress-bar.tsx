import React from "react";
import styled from "styled-components/native";

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
  background-color: ${(props) => props.theme.progressBackground};
`;

const ProgressPercentage = styled.View<{ withRadius: boolean }>`
  height: 4px;
  background-color: ${(props) => props.theme.progressActive};
  border-top-right-radius: ${(props) => (props.withRadius ? "2px" : 0)};
  border-bottom-right-radius: ${(props) => (props.withRadius ? "2px" : 0)};
`;
