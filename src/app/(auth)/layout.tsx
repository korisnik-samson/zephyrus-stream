import React from 'react';

export default function AuthLayout({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Animated gradient mesh background */}
            <div className="bg-animated-gradient fixed inset-0 -z-10"/>

            {/* Radial accent glows */}
            <div className="fixed top-1/4 -left-32 w-96 h-96 bg-accent-purple/20 rounded-full blur-[128px] -z-10"/>
            <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-accent-blue/15 rounded-full blur-[128px] -z-10"/>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md px-6 py-12 animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-display font-bold tracking-tight">
                        <span className="text-gradient-purple">Zephyrus</span>
                    </h1>
                </div>

                {children}
            </div>
        </div>
    );
}
