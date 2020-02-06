import * as O from "fp-ts/lib/Option";

export const every = <A extends O.Option<unknown>[]>(options: A): boolean =>
  options.every(O.isSome);
