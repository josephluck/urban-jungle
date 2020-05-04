import { sequenceT } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";

export const every = <A extends O.Option<unknown>[]>(options: A): boolean =>
  options.every(O.isSome);

export const getFirstLetterFromOptionString = (str: string): O.Option<string> =>
  pipe(
    str,
    O.fromPredicate((val) => val.length > 0),
    O.chain((s) => O.fromNullable(s.split("")[0]))
  );

export const sequenceO = sequenceT(O.option);
