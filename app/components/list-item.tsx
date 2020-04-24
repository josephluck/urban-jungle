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
      {detail ? <BodyText>{detail}</BodyText> : null}
    </Detail>
  </Container>
);

const Container = styled.View`
  margin-bottom: ${symbols.spacing._20};
  flex-direction: row;
  align-items: center;
`;

const circleSize = 66;

const Circle = styled.View`
  width: ${circleSize};
  height: ${circleSize};
  background-color: ${symbols.colors.nearWhite};
  border-radius: ${circleSize / 2};
  margin-right: ${symbols.spacing._12};
`;

const Detail = styled.View`
  flex: 1;
`;

const Title = styled(SubHeading)`
  margin-bottom: ${symbols.spacing._2};
`;
