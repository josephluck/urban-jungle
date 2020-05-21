import { PlantModel } from "@urban-jungle/shared/models/plant";
import { TodoModel } from "@urban-jungle/shared/models/todo";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { PlantImage } from "./plant-image";
import { PlantNameAndLocation } from "./plant-name-and-location";
import { Heading, Paragraph } from "./typography";

export const TodoOverview = ({
  plant,
  todo,
}: {
  plant: PlantModel;
  todo: TodoModel;
}) => (
  <>
    <PlantNameAndLocation name={plant.name} location={plant.location} />
    <PlantImage
      uri={pipe(
        O.fromNullable(plant.avatar),
        O.map((avatar) => avatar.uri),
        O.getOrElse(() => undefined as string | undefined)
      )}
    />
    <Title>{todo.title}</Title>
    <Paragraph>{todo.detail}</Paragraph>
  </>
);

const Title = styled(Heading)`
  margin-vertical: ${symbols.spacing._20}px;
`;
