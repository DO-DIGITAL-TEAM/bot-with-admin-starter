import { forwardRef } from 'react';
import { PiTrashBold as ClearIcon } from 'react-icons/pi';
import { Button, CardSection, Group, Pill, Text, type GroupProps } from '@mantine/core';
import { FilteringType } from '@/api/helpers';

export interface DataTableFiltersProps extends Omit<GroupProps, 'children'> {
  filters: FilteringType[];
  onClear?: () => void;
  onRemove?: (field: string) => void;
}

const formatFilterValue = (value: FilteringType['value']): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return String(value);
};

export const DataTableFilters = forwardRef<HTMLDivElement, DataTableFiltersProps>(
  ({ filters, onClear, onRemove, py = 'md', ...props }, ref) => {
    if (filters.length === 0) {
      return null;
    }

    return (
      <CardSection inheritPadding withBorder ref={ref}>
        <Group py={py} {...props}>
          {filters.map((filter) => (
            <Text fz="sm" c="dimmed" key={filter.field}>
              {filter.label || filter.field}:
              <Pill 
                ml="0.25rem" 
                withRemoveButton 
                onRemove={() => onRemove?.(filter.field)}
              >
                {formatFilterValue(filter.value)}
              </Pill>
            </Text>
          ))}

          {onClear && (
            <Button
              variant="subtle"
              size="compact-xs"
              color="red"
              leftSection={<ClearIcon size="1rem" />}
              onClick={onClear}
            >
              Clear
            </Button>
          )}
        </Group>
      </CardSection>
    );
  }
);
