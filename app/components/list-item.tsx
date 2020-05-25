import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { CircleImage } from "./circle-image";
import { BodyText, SubHeading } from "./typography";

export const ListItem = ({
  title,
  detail,
  image,
  showImageFallback = true,
}: {
  title?: React.ReactNode;
  detail?: React.ReactNode;
  image?: string;
  showImageFallback?: boolean;
}) => (
  <Container>
    {image ? <CircleImg uri={image} /> : showImageFallback ? <Circle /> : null}
    <Detail>
      {title ? <Title>{title}</Title> : null}
      {detail ? <DetailText>{detail}</DetailText> : null}
    </Detail>
  </Container>
);

const Container = styled.View`
  margin-bottom: ${symbols.spacing._20}px;
  flex-direction: row;
  align-items: center;
`;

const CircleImg = styled(CircleImage)`
  margin-right: ${symbols.spacing._12}px;
`;

const Circle = styled.View`
  height: 66px;
  width: 66px;
  border-radius: 66px;
  background-color: ${symbols.colors.nearWhite};
`;

const Detail = styled.View`
  flex: 1;
`;

const Title = styled(SubHeading)`
  margin-bottom: ${symbols.spacing._2}px;
`;

const DetailText = styled(BodyText)`
  color: ${symbols.colors.midOffGray};
`;
