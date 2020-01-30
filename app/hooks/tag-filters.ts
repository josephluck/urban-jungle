import { useState, useCallback } from "react";

interface Filter {
  id: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  filtersLoading: boolean;
  filters: Filter[];
}

export const useFiltersState = (groups: FilterGroup[] = []) => {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(groups);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const setFilterActive = useCallback(
    (id: string) => {
      if (activeFilters.includes(id)) {
        setActiveFilters(af => af.filter(i => i !== id));
      } else {
        setActiveFilters(af => [...af, id]);
      }
    },
    [activeFilters.length]
  );

  const clearAllFilters = useCallback(() => {
    setActiveFilters([]);
  }, [setActiveFilters]);

  const activeFiltersHash = activeFilters.join("-");

  return {
    filterGroups,
    setFilterGroups,
    setFilterActive,
    activeFilters,
    activeFiltersHash,
    clearAllFilters
  };
};
