/**
 * Standard API response wrapper used throughout the application.
 * 
 * All API endpoints return responses in this format for consistency.
 * 
 * @template T - Type of the data payload
 * 
 * @example
 * ```typescript
 * // Success response
 * {
 *   statusCode: 200,
 *   message: "Success",
 *   data: { id: 1, name: "John" }
 * }
 * 
 * // Error response
 * {
 *   statusCode: 400,
 *   message: "Validation failed",
 *   data: null
 * }
 * ```
 */
export interface ApiResponse<T> {
  /** HTTP status code */
  statusCode: number;
  /** Human-readable message */
  message: string;
  /** Response payload data */
  data: T;
}

/**
 * Paginated response structure for list endpoints.
 * 
 * Used with pagination decorator to return paginated results.
 * 
 * @template T - Type of items in the paginated list
 * 
 * @example
 * ```typescript
 * {
 *   statusCode: 200,
 *   message: "Success",
 *   data: {
 *     totalCount: 100,
 *     items: [
 *       { id: 1, name: "Item 1" },
 *       { id: 2, name: "Item 2" }
 *     ]
 *   }
 * }
 * ```
 */
export interface PaginatedResponse<T> {
  /** Total number of items matching the query */
  totalCount: number;
  /** Array of items for the current page */
  items: T[];
}
