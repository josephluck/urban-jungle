type FilterType<O, T> = { [K in keyof O]: O[K] extends T ? K : never };
type FilterTypeForKeys<O, T> = FilterType<O, T>[keyof O];

export const normalizeArrayByKey = <T extends any>(
  data: T[],
  key: FilterTypeForKeys<T, string>
) =>
  data.reduce((acc, curr) => {
    acc[curr[key]] = curr;
    return acc;
  }, ({} as any) as { [id: string]: T });

interface ValidObjWithId {
  id: string;
  [key: string]: any;
}

export const normalizeArrayById = <T extends ValidObjWithId>(data: T[]) =>
  normalizeArrayByKey(data, "id" as any);
