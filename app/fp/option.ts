import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";

export const every = <A extends O.Option<unknown>[]>(options: A): boolean =>
  options.every(O.isSome);

export const getFirstLetterFromOptionString = (
  str: O.Option<string>
): O.Option<string> =>
  pipe(
    str,
    O.chain(s => O.fromNullable(s.split("")[0]))
  );
