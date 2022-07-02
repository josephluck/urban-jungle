import { ListItem } from "@urban-jungle/design/components/list-item";
import { PlantModel } from "@urban-jungle/shared/models/plant";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";
import { getPlantName } from "../../../store/selectors";

export const PlantListItem = React.memo(
  ({ plant, right }: { plant: PlantModel; right?: React.ReactNode }) => (
    <ListItem
      title={getPlantName(plant)}
      image={pipe(
        O.fromNullable(plant.avatar),
        O.map((avatar) => avatar.uri),
        O.getOrElse(() => ""),
      )}
      right={right}
    />
  ),
  (prev, next) =>
    prev.plant.id !== next.plant.id || prev.plant.name !== next.plant.name,
);
