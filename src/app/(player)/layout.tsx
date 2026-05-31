import React from "react";

export default function PlayerLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <div className="h-screen w-screen bg-black overflow-hidden">
            {children}
        </div>
    );
}
