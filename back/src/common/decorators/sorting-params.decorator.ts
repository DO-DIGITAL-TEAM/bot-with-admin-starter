import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ErrorCode } from '../enums/error-code.enum';

/**
 * Sort direction for database queries.
 */
type Direction = 'ASC' | 'DESC';

/**
 * Sorting parameters extracted from query string.
 * 
 * @example
 * ```typescript
 * // Query: ?sort=created_at:DESC
 * // Results in: { created_at: 'DESC' }
 * ```
 */
export interface ISorting {
  /** Field name mapped to sort direction */
  [field: string]: Direction;
}

/**
 * Custom decorator for parsing sorting query parameters.
 * 
 * Extracts `sort` from query string in format `field:direction`.
 * Validates that the field is in the allowed list.
 * 
 * @param validParams - Array of field names that can be sorted
 * @returns Decorator that extracts and validates sort parameters
 * 
 * @example
 * ```typescript
 * // In controller
 * @Get()
 * findChunk(@SortingParams(['id', 'created_at', 'username']) sorting: ISorting) {
 *   return this.service.findChunk(sorting);
 * }
 * 
 * // Query: ?sort=created_at:DESC
 * // Results in: { created_at: 'DESC' }
 * ```
 * 
 * @throws BadRequestException if sort format is invalid or field is not allowed
 */
export const SortingParams = createParamDecorator((validParams, ctx: ExecutionContext): ISorting => {
  const req: Request = ctx.switchToHttp().getRequest();
  const sort = req.query.sort as string;
  if (!sort) return null;

  // check if the valid params sent is an array
  if (typeof validParams !== 'object') throw new BadRequestException(ErrorCode.InvalidSortParams);

  // check the format of the sort query param
  const sortPattern = /^([a-zA-Z0-9_]+):(ASC|DESC|asc|desc)$/;
  if (!sort.match(sortPattern)) throw new BadRequestException(ErrorCode.InvalidSortParams);

  // extract the field name and direction and check if they are valid
  const [field, direction] = sort.split(':');
  if (!validParams.includes(field)) throw new BadRequestException(`${ErrorCode.InvalidSortParams}:${field}`);

  return {
    [field]: direction.toUpperCase() as Direction,
  };
});
