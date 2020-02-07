import React from "react";
import { SectionList } from "react-native";
import styled from "styled-components/native";

export const Timeline = ({ householdId }: { householdId: string }) => {
  console.log({ householdId });
  return (
    <Wrapper>
      <SectionList sections={[]} renderItem={() => <></>} />
    </Wrapper>
  );
};

const Wrapper = styled.View``;
