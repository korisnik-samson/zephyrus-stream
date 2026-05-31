"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Wire up to backend password reset endpoint
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="glass rounded-[var(--radius-modal)] p-8 text-center animate-scale-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-green/15 flex items-center justify-center animate-scale-in">
          <CheckCircle2 className="w-8 h-8 text-accent-green" />
        </div>

        <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
          Check your inbox
        </h2>
        <p className="text-text-muted text-sm mb-8 max-w-xs mx-auto">
          If an account exists for <span className="text-text-primary font-medium">{email}</span>,
          you&apos;ll receive a password reset link shortly.
        </p>

        <Link href="/login">
          <Button variant="outline" className="w-full border-border text-text-primary hover:bg-bg-glass cursor-pointer">
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="glass rounded-[var(--radius-modal)] p-8 animate-scale-in">
      <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
        Reset your password
      </h2>
      <p className="text-text-muted text-sm mb-8">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-text-secondary">Email address</Label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="bg-bg-card border-border text-text-primary placeholder:text-text-muted focus-visible:ring-accent-purple"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="w-full bg-gradient-purple-btn text-white shadow-glow-purple hover:shadow-glow-purple-lg cursor-pointer"
        >
          {loading ? (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <p className="text-sm text-text-muted text-center mt-8">
        Remember your password?{" "}
        <Link href="/login" className="text-accent-purple-light hover:text-accent-purple font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
