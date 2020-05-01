import { ListItem } from "./list-item";
import React, { useMemo } from "react";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { CareModel } from "../models/care";

export const CareListItem = React.memo(
  ({ care }: { care: CareModel }) => {
    const image = useMemo(
      () =>
        pipe(
          O.fromNullable(care.plant.avatar),
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
