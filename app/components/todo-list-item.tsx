import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useMemo } from "react";

import { TodoWithPlantModel } from "../features/todos/store/state";
import { ListItem } from "./list-item";

export const TodoListItem = React.memo(
  ({ todo }: { todo: TodoWithPlantModel }) => {
    const image = useMemo(
      () =>
        pipe(
          todo.plant,
          O.chain((plant) => O.fromNullable(plant.avatar)),
          O.map((avatar) => avatar.uri),
          O.getOrElse(() => ""),
        ),
      [todo.id],
    );
    return <ListItem title={todo.title} image={image} />;
  },
  (prev, next) =>
    prev.todo.id !== next.todo.id || prev.todo.title !== next.todo.title,
);
