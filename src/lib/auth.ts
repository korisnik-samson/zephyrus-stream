import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { API_URL } from "@/lib/constants";
import type { AuthResponse } from "@/types/auth";
import type { ApiResponse } from "@/types/api";

/**
 * NextAuth.js v5 configuration.
 * Uses CredentialsProvider to authenticate against the Spring Boot backend.
 */
const authConfig: NextAuthConfig = {
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const res = await fetch(`${API_URL}/api/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    const json: ApiResponse<AuthResponse> = await res.json();

                    if (!res.ok || !json.success || !json.data) return null;

                    const { user, accessToken, refreshToken } = json.data;

                    // Return the user object with tokens attached
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.displayName,
                        image: user.avatarUrl,
                        role: user.role,
                        accessToken,
                        refreshToken,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            // On initial sign-in, attach the backend tokens
            if (user) {
                token.id = user.id;
                token.role = (user as unknown as Record<string, unknown>).role as string;
                token.accessToken = (user as unknown as Record<string, unknown>).accessToken as string;
                token.refreshToken = (user as unknown as Record<string, unknown>).refreshToken as string;
            }
            return token;
        },

        async session({ session, token }) {
            // Expose user info + access token to client
            if (session.user) {
                session.user.id = token.id as string;
                (session as unknown as Record<string, unknown>).accessToken = token.accessToken;
                (session.user as unknown as Record<string, unknown>).role = token.role;
            }
            return session;
        },
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },

    secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
