import React from "react";
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
    variable: "--font-plus-jakarta",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Zephyrus — Stream Without Limits",
        template: "%s | Zephyrus",
    },
    description: "Discover and stream thousands of movies, series, and exclusive originals. Your premium cinematic experience starts here.",
    keywords: [
        "streaming",
        "movies",
        "series",
        "originals",
        "watch online",
        "Zephyrus",
    ],
    authors: [{ name: "Samson" }],
    openGraph: {
        type: "website",
        locale: "en_US",
        siteName: "Zephyrus",
        title: "Zephyrus — Stream Without Limits",
        description: "Discover and stream thousands of movies, series, and exclusive originals.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Zephyrus — Stream Without Limits",
        description: "Discover and stream thousands of movies, series, and exclusive originals.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans antialiased`}>
                <TooltipProvider>
                    {children}
                    <Toaster richColors position="top-right"/>
                </TooltipProvider>
            </body>
        </html>
    );
}
