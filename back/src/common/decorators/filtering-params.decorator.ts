import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import {
  Between,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';
import { ErrorCode } from '../enums/error-code.enum';

export type EntityFields<T> = (keyof T)[];

export interface IFiltering {
  [key: string]: unknown;
}

interface IFilteringParams {
  field: string;
  rule: string;
  value: string;
}

/**
 * Valid filter rules for query parameter filtering.
 * 
 * Used with FilteringParams decorator to filter database queries.
 * 
 * @example
 * ```typescript
 * // In controller
 * @Get()
 * findChunk(@FilteringParams(['username', 'role']) filtering: IFiltering) {
 *   return this.service.findChunk(filtering);
 * }
 * 
 * // Query: ?filters[]=username:like:john&filters[]=role:eq:admin
 * ```
 */
export enum FilterRule {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
  LIKE = 'like',
  NOT_LIKE = 'nlike',
  IN = 'in',
  NOT_IN = 'nin',
  IS_NULL = 'isnull',
  IS_NOT_NULL = 'isnotnull',
  BETWEEN = 'between',
}

/**
 * Converts filter parameters to TypeORM where clause.
 * 
 * @param filter - Filter parameters with field, rule, and value
 * @returns TypeORM where clause object or empty object if invalid
 * 
 * @internal
 * This function is used internally by FilteringParams decorator.
 */
export const getWhere = (filter: IFilteringParams) => {
  if (!filter) return {};

  if (filter.rule == FilterRule.IS_NULL) return IsNull();
  if (filter.rule == FilterRule.IS_NOT_NULL) return Not(IsNull());
  if (filter.rule == FilterRule.EQUALS) {
    if (!filter.value || filter.value.trim() === '') return {};
    return filter.value;
  }
  if (filter.rule == FilterRule.NOT_EQUALS) {
    if (!filter.value || filter.value.trim() === '') return {};
    return Not(filter.value);
  }
  if (filter.rule == FilterRule.GREATER_THAN) return MoreThan(filter.value);
  if (filter.rule == FilterRule.GREATER_THAN_OR_EQUALS) return MoreThanOrEqual(filter.value);
  if (filter.rule == FilterRule.LESS_THAN) return LessThan(filter.value);
  if (filter.rule == FilterRule.LESS_THAN_OR_EQUALS) return LessThanOrEqual(filter.value);
  if (filter.rule == FilterRule.LIKE) return ILike(`%${filter.value}%`);
  if (filter.rule == FilterRule.NOT_LIKE) return Not(ILike(`%${filter.value}%`));
  if (filter.rule == FilterRule.IN) {
    const values = filter.value.split(',').filter((v) => v.trim() !== '');
    return values.length > 0 ? In(values) : {};
  }
  if (filter.rule == FilterRule.NOT_IN) {
    const values = filter.value.split(',').filter((v) => v.trim() !== '');
    return values.length > 0 ? Not(In(values)) : {};
  }
  if (filter.rule == FilterRule.BETWEEN) {
    const [from, to] = filter.value.split(',') as [string?, string?];
    if (!from || !to) return {};
    return Between(from, to);
  }

  return {};
}

function ensureObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Custom decorator for parsing and validating filter query parameters.
 * 
 * Supports nested filtering with dot notation (e.g., 'user.name:like:john').
 * Filters are passed as query parameter array: `filters[]=field:rule:value`
 * 
 * @param allowedFields - Array of field names that can be filtered
 * @returns Decorator that extracts and validates filter parameters
 * 
 * @example
 * ```typescript
 * // In controller
 * @Get()
 * findChunk(
 *   @FilteringParams(['username', 'role', 'is_active']) filtering: IFiltering
 * ) {
 *   return this.service.findChunk(filtering);
 * }
 * 
 * // Query examples:
 * // ?filters[]=username:like:john
 * // ?filters[]=role:eq:admin&filters[]=is_active:eq:true
 * // ?filters[]=id:between:10,20
 * ```
 * 
 * @throws BadRequestException if filter format is invalid or field is not allowed
 */
export const FilteringParams = createParamDecorator(
  (data: readonly string[], ctx: ExecutionContext): IFiltering | null => {
    const req: Request = ctx.switchToHttp().getRequest();
    const rawFilters = req.query.filters;
    const queryFilters = Array.isArray(rawFilters)
      ? rawFilters
      : typeof rawFilters === 'string'
        ? [rawFilters]
        : null;

    if (!queryFilters) return null;
    if (!Array.isArray(data)) throw new BadRequestException(ErrorCode.InvalidFilterParams);

    const filters: IFiltering = {};

    for (const filter of queryFilters) {
      if (typeof filter !== 'string') {
        throw new BadRequestException(ErrorCode.InvalidFilterParams);
      }

      const [fieldPath, rule, value] = filter.split(':');

      if (!fieldPath || !rule || value === undefined) {
        throw new BadRequestException(ErrorCode.InvalidFilterParams);
      }

      const fieldParts = fieldPath.split('.');
      const field = fieldParts.pop();

      if (!field) {
        throw new BadRequestException(ErrorCode.InvalidFilterParams);
      }

      let nestedFilters: Record<string, unknown> = filters;
      
      for (const part of fieldParts) {
        const existing = nestedFilters[part];

        if (!ensureObjectRecord(existing)) {
          nestedFilters[part] = {};
        }

        nestedFilters = nestedFilters[part] as Record<string, unknown>;
      }

      if (!data.includes(fieldPath)) {
        throw new BadRequestException(`${ErrorCode.FilterFieldNotAllowed}:${field}`);
      }

      if (!Object.values(FilterRule).includes(rule as FilterRule)) {
        throw new BadRequestException(`${ErrorCode.InvalidFilterParams}:${rule}`);
      }

      const isEmptyValueRule = [
        FilterRule.EQUALS,
        FilterRule.NOT_EQUALS,
        FilterRule.IN,
        FilterRule.NOT_IN,
      ].includes(rule as FilterRule) && (!value || value.trim() === '');

      if (isEmptyValueRule) {
        continue;
      }

      const whereClause = getWhere({ field, rule, value });

      if (ensureObjectRecord(whereClause) && Object.keys(whereClause).length === 0) {
        continue;
      }

      nestedFilters[field] = whereClause;
    }

    return filters;
  },
);

