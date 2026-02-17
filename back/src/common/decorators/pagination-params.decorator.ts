import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ErrorCode } from '../enums/error-code.enum';

/**
 * Pagination parameters extracted from query string.
 * 
 * @example
 * ```typescript
 * // Query: ?page=2&size=25
 * // Results in: { limit: 25, offset: 25, page: 2 }
 * ```
 */
export interface IPagination {
  /** Maximum number of items to return */
  limit: number;
  /** Number of items to skip */
  offset: number;
  /** Current page number (1-indexed, for infinite scroll on client side) */
  page?: number;
}

/**
 * Paginated resource response structure.
 * 
 * @template T - Type of items in the paginated list
 */
export type PaginatedResource<T> = {
  /** Total number of items matching the query */
  totalCount: number;
  /** Array of items for the current page */
  items: T[];
  /** Current page number (for infinite scroll on client side) */
  page?: number;
};

/**
 * Custom decorator for parsing pagination query parameters.
 * 
 * Extracts `page` and `size` from query string and converts to limit/offset.
 * Page is 1-indexed. Maximum size is 250.
 * 
 * @returns Decorator that extracts pagination parameters
 * 
 * @example
 * ```typescript
 * // In controller
 * @Get()
 * findChunk(@PaginationParams() pagination: IPagination) {
 *   return this.service.findChunk(pagination);
 * }
 * 
 * // Query: ?page=2&size=25
 * // Results in: { limit: 25, offset: 25, page: 2 }
 * ```
 * 
 * @throws BadRequestException if page or size are invalid or size > 250
 */
export const PaginationParams = createParamDecorator((data, ctx: ExecutionContext): IPagination => {
  const req: Request = ctx.switchToHttp().getRequest();
  const page = parseInt(req.query.page as string);
  const size = parseInt(req.query.size as string);

  // check if page and size are valid
  if (isNaN(page) || page < 0 || isNaN(size) || size < 0) {
    throw new BadRequestException(ErrorCode.InvalidPaginationParams);
  }
  // do not allow to fetch large slices of the dataset
  if (size > 250) {
    throw new BadRequestException(ErrorCode.MaximumChunkSizeExceeded);
  }

  const limit = size;
  const offset = (page - 1) * limit;
  return { limit, offset, page };
});
