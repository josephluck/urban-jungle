import React from "react";
import styled from "styled-components/native";
import { PlantModel } from "../models/plant";
import { TodoModel } from "../models/todo";
import { symbols } from "../theme";
import { PlantOverview } from "./plant-overview";
import { Heading, Paragraph } from "./typography";

export const TodoOverview = ({
  plant,
  todo,
}: {
  plant: PlantModel;
  todo: TodoModel;
}) => (
  <>
    <PlantOverview
      name={plant.name}
      location={plant.location}
      avatar={plant.avatar}
    />
    <Title>{todo.title}</Title>
    <Paragraph>{todo.detail}</Paragraph>
  </>
);

const Title = styled(Heading)`
  margin-vertical: ${symbols.spacing._20}px;
`;
