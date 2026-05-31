"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail } from "lucide-react";
import React from "react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid email or password");
            } else {
                toast.success("Welcome back!");
                router.push("/profiles");
                router.refresh();
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-[var(--radius-modal)] p-8 animate-scale-in">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
                Welcome back
            </h2>
            <p className="text-text-muted text-sm mb-8">
                Sign in to continue streaming
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-text-secondary">
                        Email address
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"/>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                            className="pl-10 bg-bg-card border-border text-text-primary placeholder:text-text-muted focus-visible:ring-accent-purple"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-text-secondary">
                        Password
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"/>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                            className="pl-10 bg-bg-card border-border text-text-primary placeholder:text-text-muted focus-visible:ring-accent-purple"
                        />
                    </div>
                </div>

                <Button type="submit" disabled={loading}
                    className="w-full bg-gradient-purple-btn text-white shadow-glow-purple hover:shadow-glow-purple-lg cursor-pointer"
                    size="lg">
                    {loading ? (
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
                    ) : (
                        <React.Fragment>
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4"/>
                        </React.Fragment>
                    )}
                </Button>
            </form>

            <div className="relative my-8">
                <Separator className="bg-border"/>
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-card px-3 text-xs text-text-muted">
          or continue with
        </span>
            </div>

            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline"
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    className="border-border text-text-primary hover:bg-bg-glass cursor-pointer">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                        <path fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                </Button>

                <Button variant="outline" onClick={() => signIn("github", { callbackUrl: "/" })}
                    className="border-border text-text-primary hover:bg-bg-glass cursor-pointer">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                </Button>
            </div>

            {/* Links */}
            <div className="mt-8 text-center space-y-3">
                <Link href="/forgot-password"
                    className="text-sm text-text-muted hover:text-accent-purple-light transition-colors">
                    Forgot your password?
                </Link>
                <p className="text-sm text-text-muted">
                    New to Zephyrus?{" "}
                    <Link href="/register"
                        className="text-accent-purple-light hover:text-accent-purple font-medium transition-colors">
                        Sign up now
                    </Link>
                </p>
            </div>
        </div>
    );
}
