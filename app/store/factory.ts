import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";

import { BaseModel } from "@urban-jungle/shared/models/base";

import { store, State } from "./state";

// TODO: keyof State should be replaced with a nicer type
export const normalizedStateFactory = <Model extends BaseModel>(
  stateKey: keyof State,
) => {
  const selectNormalized = store.createSelector(
    (s, normalizerKey: string): O.Option<Record<string, Model>> =>
      // @ts-ignore
      O.fromNullable(s[stateKey].byHouseholdId[normalizerKey]),
  );

  const selectMany = (normalizerKey: string): Model[] =>
    pipe(
      selectNormalized(normalizerKey),
      O.map(Object.values),
      O.getOrElse(() => [] as Model[]),
    );

  const selectManyIds = (normalizerKey: string): string[] =>
    pipe(
      selectNormalized(normalizerKey),
      O.map(Object.keys),
      O.getOrElse(() => [] as string[]),
    );

  const selectManyByIds = (normalizerKey: string, ids: string[]): Model[] =>
    selectMany(normalizerKey).filter((entity) => ids.includes(entity.id));

  const select = (normalizerKey: string, id: string): O.Option<Model> =>
    pipe(
      selectNormalized(normalizerKey),
      O.chain((values) => O.fromNullable(values[id])),
    );

  const upsert = store.createMutator(
    (s, normalizerKey: string, entity: Model) => {
      // @ts-ignore
      s[stateKey].byHouseholdId[normalizerKey] = {
        // @ts-ignore
        ...s[stateKey].byHouseholdId[normalizerKey],
        [entity.id]: entity,
      };
    },
  );

  const upsertMany = store.createMutator(
    (s, normalizerKey: string, entities: Model[]) => {
      entities.forEach((entity) => {
        // @ts-ignore
        s[stateKey].byHouseholdId[normalizerKey] = {
          // @ts-ignore
          ...s[stateKey].byHouseholdId[normalizerKey],
          [entity.id]: entity,
        };
      });
    },
  );

  const remove = store.createMutator(
    (s, normalizerKey: string, entity: Model) => {
      // @ts-ignore
      delete s[stateKey].byHouseholdId[normalizerKey][entity.id];
    },
  );

  const removeMany = store.createMutator(
    (s, normalizerKey: string, entities: Model[]) => {
      entities.forEach((entity) => {
        // @ts-ignore
        delete s[stateKey].byHouseholdId[normalizerKey][entity.id];
      });
    },
  );

  return {
    selectNormalized,
    select,
    selectMany,
    selectManyIds,
    selectManyByIds,
    upsert,
    upsertMany,
    remove,
    removeMany,
  };
};
