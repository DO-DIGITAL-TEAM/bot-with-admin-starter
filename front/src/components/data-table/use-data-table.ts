import { useMemo, useState } from 'react';
import { DataTableSortStatus } from 'mantine-datatable';
import { useDebouncedValue } from '@mantine/hooks';
import { isDefined } from '@/utilities/is';
import { DataTableTabsProps } from './data-table-tabs';
import { FilteringType } from '@/api/helpers';

export interface UseDataTableArgs<SortableFields> {
  tabsConfig?: DataTableTabsProps;
  sortConfig?: {
    column: DataTableSortStatus<SortableFields>['columnAccessor'];
    direction: DataTableSortStatus<SortableFields>['direction'];
  };
}

export type UseDataTableReturn<SortableFields = any> = ReturnType<
  typeof useDataTable<SortableFields>
>;

export function useDataTable<SortableFields>({
  tabsConfig,
  sortConfig,
}: UseDataTableArgs<SortableFields>) {
  const [currentTab, setCurrentTab] = useState(tabsConfig?.tabs[0].value);
  const [filters, setFilters] = useState<FilteringType[]>([]);
  const [debouncedFilters] = useDebouncedValue(filters, 500);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<SortableFields>>({
    columnAccessor: sortConfig?.column ?? '',
    direction: sortConfig?.direction ?? 'asc',
  });

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    tabsConfig?.onChange?.(value);
  };

  const handleClearFilters = () => {
    setFilters([]);
  };

  const handleRemoveFilter = (field: string) => {
    setFilters((prevFilters) => {
      return prevFilters.filter(f => f.field !== field);
    });
  };

  const handleChangeFilter = (filter: FilteringType) => {
    if (isDefined(filter.value)) {
      setFilters(prevFilters => {
        const existingFilterIndex = prevFilters.findIndex(f => f.field === filter.field);
        if (existingFilterIndex >= 0) {
          const newFilters = [...prevFilters];
          newFilters[existingFilterIndex] = filter;
          return newFilters;
        }
        return [...prevFilters, filter];
      });
    } else {
      handleRemoveFilter(filter.field);
    }
  };

  const queryFormattedFilters = useMemo(
    () =>
      Object.values(debouncedFilters)
        .filter(({ value }) => isDefined(value))
        .reduce((acc, { field, value }) => ({ ...acc, [field]: value }), {}),
    [debouncedFilters]
  );

  return {
    tabs: {
      value: currentTab,
      change: handleTabChange,
      tabs: tabsConfig?.tabs ?? [],
    },
    filters: {
      filters,
      clear: handleClearFilters,
      change: handleChangeFilter,
      remove: handleRemoveFilter,
      query: queryFormattedFilters,
    },
    sort: {
      change: setSortStatus as any, // TODO: fix type
      column: sortStatus.columnAccessor as keyof SortableFields,
      direction: sortStatus.direction,
      status: sortStatus,
      query: `${sortStatus.columnAccessor.toString()}:${sortStatus.direction}` as const,
    },
  } as const;
}
