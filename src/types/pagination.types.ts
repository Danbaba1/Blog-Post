export interface PaginationQuery {
  page?: string;
  limit?: string;
  published?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
}
