"use client";

import { signIn, signOut, useSession } from "next-auth/react";

/**
 * Custom auth hook wrapping NextAuth's useSession.
 * Provides typed user data and convenience methods.
 */
export function useAuth() {
    const { data: session, status } = useSession();

    const isAuthenticated = status === "authenticated";
    const isLoading = status === "loading";

    const user = session?.user ? {
        id: session.user.id ?? "",
        email: session.user.email ?? "",
        displayName: session.user.name ?? "",
        avatarUrl: session.user.image ?? null,
        role: ((session.user as unknown as Record<string, unknown>).role as string) ?? "USER",
    } : null;

    const accessToken = session ? ((session as unknown as Record<string, unknown>).accessToken as string) ?? null : null;

    return {
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
    };
}
