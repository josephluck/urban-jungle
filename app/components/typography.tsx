import styled from "styled-components/native";
import { SOURCE_SANS_SEMIBOLD } from "../hooks/fonts";

export const Heading = styled.Text`
  color: ${props => props.theme.colors.pureWhite};
  font-weight: ${props => props.theme.fontWeight.medium};
  font-size: ${props => props.theme.font._24.size}px;
  line-height: ${props => props.theme.font._24.lineHeight}px;
  font-family: ${SOURCE_SANS_SEMIBOLD};
`;

export const PageHeading = styled(Heading)`
  margin-left: ${props => props.theme.spacing._18};
  margin-vertical: ${props => props.theme.spacing._18};
`;

export const SubHeading = styled.Text`
  color: ${props => props.theme.colors.pureWhite};
  font-weight: ${props => props.theme.fontWeight.medium};
  font-size: ${props => props.theme.font._20.size}px;
  line-height: ${props => props.theme.font._20.lineHeight}px;
  font-family: ${SOURCE_SANS_SEMIBOLD};
`;

export const ListItemTitle = styled.Text`
  color: ${props => props.theme.colors.pureWhite};
  font-weight: ${props => props.theme.fontWeight.medium};
  font-size: ${props => props.theme.font._16.size}px;
  line-height: ${props => props.theme.font._16.lineHeight}px;
  font-family: ${SOURCE_SANS_SEMIBOLD};
`;

export const SubDetailText = styled.Text`
  letter-spacing: 0.3;
  font-weight: ${props => props.theme.fontWeight.medium};
  font-size: ${props => props.theme.font._12.size}px;
  line-height: ${props => props.theme.font._12.lineHeight}px;
  color: ${props => props.theme.colors.lightOffGray};
  font-family: ${SOURCE_SANS_SEMIBOLD};
`;

export const TagLabel = styled.Text`
  font-weight: ${props => props.theme.fontWeight.medium};
  font-size: ${props => props.theme.font._16.size}px;
  line-height: ${props => props.theme.font._16.lineHeight}px;
  color: ${props => props.theme.colors.lightOffGray};
  font-family: ${SOURCE_SANS_SEMIBOLD};
`;
