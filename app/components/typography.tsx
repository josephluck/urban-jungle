import styled from "styled-components/native";
import { CAROS_BOLD, CAROS_SEMIBOLD, CAROS_REGULAR } from "../hooks/fonts";
import { symbols } from "../theme";

type FontWeight = "regular" | "semibold" | "bold";

const getFontFromWeight = (weight: FontWeight = "regular") =>
  weight === "bold"
    ? CAROS_BOLD
    : weight === "semibold"
    ? CAROS_SEMIBOLD
    : CAROS_REGULAR;

export const BodyText = styled.Text<{ weight?: FontWeight }>`
  color: ${(props) => props.theme.defaultTextColor};
  font-size: ${symbols.font._16.size}px;
  line-height: ${symbols.font._16.lineHeight}px;
  font-family: ${(props) => getFontFromWeight(props.weight || "regular")};
`;

export const SubHeading = styled.Text<{ weight?: FontWeight }>`
  color: ${(props) => props.theme.defaultTextColor};
  font-size: ${symbols.font._20.size}px;
  line-height: ${symbols.font._20.lineHeight}px;
  font-family: ${(props) => getFontFromWeight(props.weight || "semibold")};
`;

export const Heading = styled.Text<{ weight?: FontWeight }>`
  color: ${(props) => props.theme.defaultTextColor};
  font-size: ${symbols.font._28.size}px;
  line-height: ${symbols.font._28.lineHeight}px;
  font-family: ${(props) => getFontFromWeight(props.weight || "bold")};
`;
