import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";

/**
 * TODO: these should be configurable from the consuming app
 */
export const CAROS_BLACK = "CAROS_BLACK";
export const CAROS_BOLD = "CAROS_BOLD";
export const CAROS_SEMIBOLD = "CAROS_SEMIBOLD";
export const CAROS_REGULAR = "CAROS_REGULAR";

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

export const TertiaryText = styled.Text`
  color: ${(props) => props.theme.defaultTextColor};
  font-size: ${symbols.font._12.size}px;
  line-height: ${symbols.font._12.lineHeight}px;
  font-family: ${CAROS_SEMIBOLD};
`;

export const SubScriptText = styled(TertiaryText)`
  color: ${(props) => props.theme.secondaryTextColor};
  font-size: ${symbols.font._8.size}px;
  line-height: ${symbols.font._8.lineHeight}px;
`;

export const Paragraph = styled(BodyText)`
  line-height: ${symbols.font._16.lineHeight * 1.2}px;
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

export const ScreenTitle = ({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) => (
  <ScreenTitleContainer>
    {title ? <ScreenTitleHeading>{title}</ScreenTitleHeading> : null}
    {description ? (
      <ScreenTitleDescription>{description}</ScreenTitleDescription>
    ) : null}
  </ScreenTitleContainer>
);

const ScreenTitleContainer = styled.View`
  justify-content: center;
  align-items: center;
  margin-bottom: ${symbols.spacing.appVertical}px;
`;

const ScreenTitleHeading = styled(Heading)`
  text-align: center;
`;

const ScreenTitleDescription = styled(Paragraph)`
  margin-top: ${symbols.spacing._16}px;
  text-align: center;
`;
