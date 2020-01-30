import { useState, useCallback } from "react";
import { Paginated } from "../utils/normalize";

export function useFetcher<F extends (...args: any[]) => Promise<any>>(
  fetch: F
) {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      try {
        const response = await fetch(...args);
        setLoaded(true);
        return response;
      } catch (err) {
        setErrored(true);
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  ) as typeof fetch;

  const fetchInitial = useCallback(
    async (...args: any[]) => {
      setLoaded(false);
      return await fetchData(...args);
    },
    [fetchData]
  ) as typeof fetch;

  const refresh = useCallback(
    async (...args: any[]) => {
      setRefreshing(true);
      try {
        return await fetchData(...args);
      } finally {
        setRefreshing(false);
      }
    },
    [fetchData]
  ) as typeof fetch;

  return {
    loading,
    refreshing,
    /** Fetches data and resets the loaded state */
    fetchInitial,
    /** Fetches data but does not reset the loaded state */
    fetch: fetchData,
    /** Refreshes data, additionally sets refreshing state but does not reset the loaded state */
    refresh,
    loaded,
    errored
  };
}

type Fetcher = (
  from: number,
  size: number
) => (...args: any[]) => Promise<Paginated<any>>;

export const usePaginatedFetcher = <Fn extends Fetcher>(
  fetch: Fn,
  idKeyName: string,
  size = 30
) => {
  type Return = ReturnType<typeof fetch>;

  const [ids, setIds] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingNextPage, setLoadingNextPage] = useState(false);

  const endReached = ids.length >= count;

  const fetchData = useCallback(
    (initial: boolean) => async (...args: any[]) => {
      const from = initial ? 0 : ids.length;
      try {
        const response = await fetch(from, size)(...args);
        const newIds = response.results.map(result => result[idKeyName]);
        setIds(initial || newIds.length === 0 ? newIds : [...ids, ...newIds]);
        setCount(response.count);
        setLoaded(true);
        return response;
      } catch (err) {
        setErrored(true);
      }
    },
    [fetch, ids.length, idKeyName]
  );

  const fetchInitial = useCallback(
    async (...args: any[]) => {
      if (!loadingInitial) {
        setLoaded(false);
        setLoadingInitial(true);
        try {
          return await fetchData(true)(...args);
        } finally {
          setLoadingInitial(false);
        }
      }
    },
    [fetchData, loadingInitial]
  ) as Return;

  const refresh = useCallback(
    async (...args: any[]) => {
      if (!refreshing) {
        setRefreshing(true);
        try {
          return await fetchData(true)(...args);
        } finally {
          setRefreshing(false);
        }
      }
    },
    [fetchData, refreshing]
  ) as Return;

  const fetchNextPage = useCallback(
    async (...args: any[]) => {
      if (!loadingNextPage && !endReached) {
        setLoadingNextPage(true);
        try {
          return await fetchData(false)(...args);
        } finally {
          setLoadingNextPage(false);
        }
      }
    },
    [fetchData, loadingNextPage, endReached]
  ) as Return;

  return {
    ids,
    loadingInitial,
    loadingNextPage,
    refreshing,
    loaded,
    errored,
    endReached,
    fetchInitial,
    fetchNextPage,
    refresh
  };
};
