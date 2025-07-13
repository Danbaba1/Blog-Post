import {
  PaginationQuery,
  PaginationOptions,
  PaginatedResponse,
} from "../types/pagination.types";

export class PaginationUtils {
  static parsePaginationQuery(query: PaginationQuery): PaginationOptions {
    const page = Math.max(1, parseInt(query.page || "1") || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(query.limit || "10") || 10)
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  static createPaginationResponse<T>(
    items: T[],
    totalItems: number,
    page: number,
    limit: number
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(totalItems / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNext,
          hasPrev,
        },
      },
    };
  }
}
