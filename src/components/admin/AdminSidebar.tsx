"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Clapperboard, Users, ArrowLeft,
  LogOut, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Content",   href: "/admin/content",   icon: Clapperboard },
  { label: "Users",     href: "/admin/users",     icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarBody = (
    <>
      {/* Logo */}
      <div className="px-6 py-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-[0.15em] text-gradient-purple">
            ZEPHYRUS
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-purple/20 text-accent-purple-light px-1.5 py-0.5 rounded">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "liquid-glass text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to App
        </Link>

        {user && (
          <div className="mt-3 pt-3 border-t border-border px-3">
            <p className="text-xs text-text-muted truncate mb-2">{user.email}</p>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 text-sm text-accent-red hover:text-accent-red-light transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 h-10 w-10 rounded-xl liquid-glass-dark flex items-center justify-center text-text-primary"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col liquid-glass-dark border-r border-border z-30">
        {SidebarBody}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 flex flex-col liquid-glass-dark border-r border-border z-50 animate-slide-in-left">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
            {SidebarBody}
          </aside>
        </>
      )}
    </>
  );
}