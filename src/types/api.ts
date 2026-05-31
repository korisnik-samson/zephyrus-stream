/** Standardized API response wrapper — mirrors backend ApiResponse<T> */
export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message: string | null;
    error: string | null;
    timestamp: string;
}

/** Paginated API response with metadata */
export interface PagedResponse<T> {
    success: boolean;
    data: T[];
    message: string | null;
    error: string | null;
    timestamp: string;
    page: number;
    totalPages: number;
    totalItems: number;
    size: number;
}

/** Structured API error */
export interface ApiError {
    status: number;
    message: string;
    error: string;
    /** Field-level validation errors */
    fieldErrors?: Record<string, string>;
    timestamp: string;
}

/** Pagination request parameters */
export interface PaginationParams {
    page?: number;
    size?: number;
    sort?: string;
}

/** Content filter parameters */
export interface ContentFilters extends PaginationParams {
    genre?: string;
    year?: number;
    rating?: string;
    mediaType?: "MOVIE" | "SERIES";
    query?: string;
}
