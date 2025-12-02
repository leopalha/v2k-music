/**
 * Cursor-based Pagination Helpers
 * More efficient than offset pagination for large datasets
 */

export interface CursorPaginationParams {
  cursor?: string | null; // Last item ID from previous page
  limit?: number;
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Build cursor-based pagination query
 */
export function buildCursorQuery(params: CursorPaginationParams) {
  const limit = Math.min(params.limit || 20, 100); // Max 100 items per page
  
  return {
    take: limit + 1, // Fetch one extra to check if there's more
    ...(params.cursor && {
      skip: 1, // Skip the cursor item itself
      cursor: {
        id: params.cursor,
      },
    }),
  };
}

/**
 * Process cursor pagination results
 */
export function processCursorResults<T extends { id: string }>(
  results: T[],
  limit: number
): CursorPaginationResult<T> {
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, -1) : results;
  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

  return {
    data,
    nextCursor,
    hasMore,
  };
}

/**
 * All-in-one cursor pagination helper
 */
export function paginate<T extends { id: string }>(
  results: T[],
  params: CursorPaginationParams
): CursorPaginationResult<T> {
  const limit = Math.min(params.limit || 20, 100);
  return processCursorResults(results, limit);
}
