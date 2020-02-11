import styled from "styled-components/native";
import { SOURCE_SANS_SEMIBOLD, SOURCE_SANS_REGULAR } from "../hooks/fonts";
import { symbols } from "../theme";

export const BodyText = styled.Text`
  color: ${props => props.theme.defaultTextColor};
  font-size: ${symbols.font._16.size}px;
  line-height: ${symbols.font._16.lineHeight}px;
  font-family: ${SOURCE_SANS_REGULAR};
`;

export const Heading = styled.Text`
  color: ${props => props.theme.defaultTextColor};
  font-weight: ${symbols.fontWeight.medium};
  font-size: ${symbols.font._24.size}px;
  line-height: ${symbols.font._24.lineHeight}px;
  font-family: ${SOURCE_SANS_SEMIBOLD};
`;

export const PageHeading = styled(Heading)`
  margin-left: ${symbols.spacing._18};
  margin-vertical: ${symbols.spacing._18};
`;

export const SubHeading = styled.Text`
  color: ${props => props.theme.defaultTextColor};
  font-weight: ${symbols.fontWeight.medium};
  font-size: ${symbols.font._20.size}px;
  line-height: ${symbols.font._20.lineHeight}px;
  font-family: ${SOURCE_SANS_SEMIBOLD};
`;

export const ListItemTitle = styled.Text`
  color: ${props => props.theme.defaultTextColor};
  font-weight: ${symbols.fontWeight.medium};
  font-size: ${symbols.font._16.size}px;
  line-height: ${symbols.font._16.lineHeight}px;
  font-family: ${SOURCE_SANS_SEMIBOLD};
`;

export const SubDetailText = styled.Text`
  letter-spacing: 0.3;
  font-weight: ${symbols.fontWeight.medium};
  font-size: ${symbols.font._12.size}px;
  line-height: ${symbols.font._12.lineHeight}px;
  color: ${props => props.theme.secondaryTextColor};
  font-family: ${SOURCE_SANS_SEMIBOLD};
`;

export const TagLabel = styled.Text`
  font-weight: ${symbols.fontWeight.medium};
  font-size: ${symbols.font._16.size}px;
  line-height: ${symbols.font._16.lineHeight}px;
  color: ${props => props.theme.secondaryTextColor};
  font-family: ${SOURCE_SANS_SEMIBOLD};
`;

export const TertiaryButtonText = styled(BodyText)`
  text-transform: uppercase;
  font-family: ${SOURCE_SANS_SEMIBOLD};
  color: ${props => props.theme.secondaryTextColor};
  font-size: ${symbols.font._14.size}px;
  letter-spacing: 0.5px;
`;
