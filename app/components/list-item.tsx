import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { BodyText, SubHeading } from "./typography";
import { Image } from "react-native";

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
    {image ? (
      <Circle>
        <Image
          width={circleSize}
          style={{ aspectRatio: 1, borderRadius: circleSize }}
          source={{ uri: image }}
        />
      </Circle>
    ) : showImageFallback ? (
      <Circle />
    ) : null}
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

const circleSize = 66;

const Circle = styled.View`
  width: ${circleSize}px;
  height: ${circleSize}px;
  background-color: ${symbols.colors.nearWhite};
  border-radius: ${circleSize / 2}px;
  margin-right: ${symbols.spacing._12}px;
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
