/** User roles */
export type Role = "USER" | "ADMIN";

/** Authenticated user */
export interface User {
    id: string;
    email: string;
    displayName: string;
    role: Role;
    avatarUrl: string | null;
    createdAt: string;
}

/** User profile (multiple per account) */
export interface Profile {
    id: string;
    userId: string;
    name: string;
    avatarUrl: string | null;
    isKids: boolean;
    language: string;
    createdAt: string;
}

/** JWT tokens returned by the auth service */
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

/** Full auth response from login/register */
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

/** Login request payload */
export interface LoginRequest {
    email: string;
    password: string;
}

/** Registration request payload */
export interface RegisterRequest {
    email: string;
    password: string;
    displayName: string;
}

/** Password reset request */
export interface ForgotPasswordRequest {
    email: string;
}

/** Refresh token request */
export interface RefreshRequest {
    refreshToken: string;
}
