import { API_URL } from "@/lib/constants";
import type { ApiResponse, PagedResponse } from "@/types/api";

/**
 * Typed fetch wrapper for the Zephyrus backend API.
 * Automatically injects Authorization header and handles errors.
 */

type RequestOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
    token?: string;
};

class ApiClient {
    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ApiResponse<T>> {
        const { body, token, headers: customHeaders, ...rest } = options;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...((customHeaders as Record<string, string>) || {}),
        };

        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...rest,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
            throw new ApiError(
                response.status,
                data.error || "An error occurred",
                data.message || undefined
            );
        }

        return data;
    }

    async get<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "GET" });
    }

    async post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "POST", body });
    }

    async put<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "PUT", body });
    }

    async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "PATCH", body });
    }

    async delete<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "DELETE" });
    }

    async getPaged<T>(endpoint: string, options?: RequestOptions) {
        const { token, headers: customHeaders } = options || {};

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...((customHeaders as Record<string, string>) || {}),
        };

        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "GET",
            headers,
        });

        const data: PagedResponse<T> = await response.json();

        if (!response.ok) throw new ApiError(response.status, data.error || "An error occurred");

        return data;
    }
}

/**
 * Custom API error with status code.
 */
export class ApiError extends Error {
    status: number;
    error: string;

    constructor(status: number, error: string, message?: string) {
        super(message || error);
        this.status = status;
        this.error = error;
        this.name = "ApiError";
    }
}

/** Singleton API client instance */
const api = new ApiClient(API_URL);
export default api;
