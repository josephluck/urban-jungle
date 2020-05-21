import { CareModel } from "@urban-jungle/shared/models/care";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useMemo } from "react";
import { ListItem } from "./list-item";

export const CareListItem = React.memo(
  ({ care }: { care: CareModel }) => {
    const image = useMemo(
      () =>
        pipe(
          O.fromNullable(care.plant.avatar),
          O.map((avatar) => avatar.uri),
          O.getOrElse(() => "")
        ),
      [care.id]
    );
    return (
      <ListItem
        title={care.todo.title}
        detail={`Done by ${care.profile.name}`}
        image={image}
      />
    );
  },
  (prev, next) => prev.care.id !== next.care.id
);
