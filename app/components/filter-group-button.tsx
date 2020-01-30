import React from "react";
import styled from "styled-components/native";
import { TagLabel } from "./typography";
import { StyleProp, ViewStyle } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown } from "@fortawesome/pro-solid-svg-icons";
import { theme } from "../theme";

export const FilterGroupButton = ({
  isActive,
  onPress,
  value,
  placeholder,
  style
}: {
  isActive: boolean;
  onPress: () => void;
  value: string[];
  placeholder: string;
  style?: StyleProp<ViewStyle>;
}) => (
  <Container onPress={onPress} isActive={isActive} style={style}>
    <Label isActive={isActive}>
      {value.length
        ? value.reduce((acc, str, i) => (i === 0 ? str : `${str}, ${acc}`), "")
        : placeholder}
    </Label>
    <ChevronWrap>
      <FontAwesomeIcon
        icon={faChevronDown}
        style={{
          color: isActive ? theme.colors.nearWhite : theme.colors.lightOffGray
        }}
        size={theme.size.iconChevron}
      />
    </ChevronWrap>
  </Container>
);

const Container = styled.TouchableOpacity<{ isActive: boolean }>`
  flex-direction: row;
  align-items: center;
  padding-top: ${props => props.theme.spacing._8};
  padding-bottom: ${props => props.theme.spacing._8};
  padding-right: ${props => props.theme.spacing._10};
  padding-left: ${props => props.theme.spacing._8};
  border-radius: ${props => props.theme.borderRadius.tiny};
  background-color: ${props =>
    props.isActive
      ? props.theme.colors.midOffGray
      : props.theme.colors.deepGray};
`;

const ChevronWrap = styled.View`
  margin-left: ${props => props.theme.spacing._6};
`;

const Label = styled(TagLabel)<{ isActive: boolean }>`
  color: ${props =>
    props.isActive
      ? props.theme.colors.nearWhite
      : props.theme.colors.lightOffGray};
`;
