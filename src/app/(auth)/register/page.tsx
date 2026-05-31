"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import api, { ApiError } from "@/lib/api";
import type { AuthResponse } from "@/types/auth";
import { AVATAR_COLORS } from "@/lib/constants";

type Step = 1 | 2 | 3;

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Account
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Step 2: Profile
    const [displayName, setDisplayName] = useState("");
    const [selectedColor, setSelectedColor] = useState<string>(AVATAR_COLORS[0]);

    // Step 3: Preferences
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    const genres = [
        "Action", "Adventure", "Animation", "Comedy", "Crime",
        "Documentary", "Drama", "Fantasy", "Horror", "Mystery",
        "Romance", "Sci-Fi", "Thriller", "War", "Western",
    ];

    const toggleGenre = (genre: string) => {
        setSelectedGenres((prev) =>
            prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
        );
    };

    const validateStep1 = () => {
        if (!email || !password || !confirmPassword) {
            toast.error("All fields are required");
            return false;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return false;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }

        return true;
    };

    const validateStep2 = () => {
        if (!displayName.trim()) {
            toast.error("Display name is required");
            return false;
        }

        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    };

    const handleBack = () => {
        if (step === 2) setStep(1);
        else if (step === 3) setStep(2);
    };

    const handleSubmit = async() => {
        setLoading(true);

        try {
            await api.post<AuthResponse>("/api/auth/register", {
                email,
                password,
                displayName: displayName.trim(),
            });

            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.ok) {
                toast.success("Account created! Welcome to Zephyrus.");
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            if (err instanceof ApiError) toast.error(err.message);
            else toast.error("Registration failed. Please try again.");

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-[var(--radius-modal)] p-8 animate-scale-in">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
                Create your account
            </h2>
            <p className="text-text-muted text-sm mb-6">Step {step} of 3</p>

            {/* Progress bar */}
            <Progress value={(step / 3) * 100} className="h-1 mb-8 bg-bg-elevated [&>div]:bg-gradient-to-r [&>div]:from-accent-purple [&>div]:to-accent-purple-light"/>

            {/* Step 1: Account Details */}
            {step === 1 && (
                <div className="space-y-4 animate-slide-up">
                    <div className="space-y-2">
                        <Label htmlFor="reg-email" className="text-text-secondary">Email address</Label>
                        <Input id="reg-email" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com" autoComplete="email" required
                            className="bg-bg-card border-border text-text-primary placeholder:text-text-muted focus-visible:ring-accent-purple" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reg-password" className="text-text-secondary">Password</Label>
                        <Input id="reg-password" type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 8 characters" autoComplete="new-password" required
                            className="bg-bg-card border-border text-text-primary placeholder:text-text-muted focus-visible:ring-accent-purple" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reg-confirm" className="text-text-secondary">Confirm password</Label>
                        <Input id="reg-confirm" type="password" value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password" autoComplete="new-password"
                            required className="bg-bg-card border-border text-text-primary placeholder:text-text-muted focus-visible:ring-accent-purple" />
                    </div>
                </div>
            )}

            {/* Step 2: Profile */}
            {step === 2 && (
                <div className="space-y-6 animate-slide-up">
                    <div className="space-y-2">
                        <Label htmlFor="display-name" className="text-text-secondary">Display name</Label>
                        <Input id="display-name" type="text" value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="How should we call you?" autoComplete="name"
                            required className="bg-bg-card border-border text-text-primary placeholder:text-text-muted focus-visible:ring-accent-purple" />
                    </div>

                    <div>
                        <Label className="text-text-secondary mb-3 block">Choose your avatar color</Label>
                        <div className="flex gap-3 flex-wrap">
                            {AVATAR_COLORS.map((color) => (
                                <button key={color} onClick={() => setSelectedColor(color)}
                                    className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center text-white font-bold text-lg cursor-pointer ${
                                        selectedColor === color
                                            ? "ring-2 ring-white ring-offset-2 ring-offset-bg-primary scale-110"
                                            : "hover:scale-105 opacity-70 hover:opacity-100"
                                    }`}
                                    style={{ backgroundColor: color }}>
                                    {displayName ? displayName[0]?.toUpperCase() : "?"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Genre Preferences */}
            {step === 3 && (
                <div className="space-y-4 animate-slide-up">
                    <p className="text-sm text-text-secondary">Select genres you enjoy (optional)</p>
                    <div className="flex flex-wrap gap-2">
                        {genres.map((genre) => (
                            <button key={genre} onClick={() => toggleGenre(genre)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                                    selectedGenres.includes(genre)
                                        ? "bg-accent-purple text-white shadow-glow-purple"
                                        : "bg-bg-elevated text-text-secondary hover:bg-bg-card hover:text-text-primary"
                                }`}>
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
                {step > 1 && (
                    <Button variant="ghost" onClick={handleBack} className="flex-1 text-text-secondary hover:text-text-primary cursor-pointer">
                        Back
                    </Button>
                )}

                {step < 3 ? (
                    <Button
                        onClick={handleNext}
                        className={`bg-gradient-purple-btn text-white shadow-glow-purple hover:shadow-glow-purple-lg cursor-pointer ${step === 1 ? "w-full" : "flex-1"}`}>
                        Continue
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-gradient-purple-btn text-white shadow-glow-purple hover:shadow-glow-purple-lg cursor-pointer">
                        {loading ? (
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                )}
            </div>

            {/* Sign in link */}
            <p className="text-sm text-text-muted text-center mt-8">
                Already have an account?{" "}
                <Link href="/login" className="text-accent-purple-light hover:text-accent-purple font-medium transition-colors">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
