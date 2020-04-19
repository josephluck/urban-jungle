import styled from "styled-components/native";
import { SOURCE_SANS_SEMIBOLD, SOURCE_SANS_REGULAR } from "../hooks/fonts";
import { symbols } from "../theme";

type FontWeight = "regular" | "semibold";

export const BodyText = styled.Text<{ weight?: FontWeight }>`
  color: ${(props) => props.theme.defaultTextColor};
  font-size: ${symbols.font._16.size}px;
  line-height: ${symbols.font._16.lineHeight}px;
  font-family: ${(props) =>
    props.weight === "semibold" ? SOURCE_SANS_SEMIBOLD : SOURCE_SANS_REGULAR};
`;

export const SubHeading = styled.Text`
  color: ${(props) => props.theme.defaultTextColor};
  font-weight: ${symbols.fontWeight.medium};
  font-size: ${symbols.font._20.size}px;
  line-height: ${symbols.font._20.lineHeight}px;
  font-family: ${SOURCE_SANS_SEMIBOLD};
`;

export const Heading = styled.Text`
  color: ${(props) => props.theme.defaultTextColor};
  font-weight: ${symbols.fontWeight.medium};
  font-size: ${symbols.font._24.size}px;
  line-height: ${symbols.font._24.lineHeight}px;
  font-family: ${SOURCE_SANS_SEMIBOLD};
`;
