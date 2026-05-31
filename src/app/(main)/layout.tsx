import React from "react";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchOverlay from "@/components/layout/SearchOverlay";

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <SessionProvider>
            <div className="flex min-h-screen flex-col bg-bg-primary">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <SearchOverlay />
            </div>
        </SessionProvider>
    );
}
