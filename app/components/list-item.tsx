import { ImageModel } from "@urban-jungle/shared/models/image";
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
  right,
}: {
  title?: React.ReactNode;
  detail?: React.ReactNode;
  image?: string | ImageModel;
  showImageFallback?: boolean;
  right?: React.ReactNode;
}) => (
  <Container>
    {typeof image !== "undefined" ? (
      image ? (
        <CircleImg uri={image} />
      ) : showImageFallback ? (
        <Circle />
      ) : null
    ) : null}
    <Detail>
      {title ? <Title weight="regular">{title}</Title> : null}
      {detail ? <DetailText>{detail}</DetailText> : null}
    </Detail>
    {right ? <Right>{right}</Right> : null}
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
  background-color: ${(props) => props.theme.avatarBackground};
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

const Right = styled.View`
  margin-left: ${symbols.spacing._12}px;
`;
