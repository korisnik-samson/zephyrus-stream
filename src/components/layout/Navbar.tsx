"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown,
  UserCircle2,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import {
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { NAV_LINKS } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const SCROLL_THRESHOLD = 60;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();

  // ─── Scroll listener ─────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── Close mobile menu on route change ────────────────────
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ─── Search submit ────────────────────────────────────────
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchOpen(false);
        setSearchQuery("");
      }
    },
    [searchQuery, router]
  );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "liquid-glass-dark border-b border-[rgba(255,200,120,0.12)]"
          : "bg-gradient-to-b from-black/80 to-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-4 md:px-8 lg:px-12">
        {/* ─── Left: Logo + Nav Links ──────────────────────── */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl font-extrabold tracking-[0.2em] text-gradient-purple font-[var(--font-display)]">
              ZEPHYRUS
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-text-primary",
                      isActive ? "text-text-primary" : "text-text-secondary"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className="block mx-auto mt-0.5 h-0.5 w-4 rounded-full bg-accent-purple" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ─── Right: Search, Notifications, Avatar ────────── */}
        <div className="flex items-center gap-2">
          {/* Search toggle / input */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center animate-fade-in"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Titles, genres, people…"
                  autoFocus
                  className="h-8 w-40 sm:w-56 rounded-md border border-border bg-bg-secondary/80 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-8 w-8 text-text-secondary hover:text-text-primary"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-text-secondary hover:text-text-primary"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* User Avatar Dropdown */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                  className="relative flex items-center gap-1.5 px-1 hover:bg-transparent focus-visible:ring-0 cursor-pointer"
                >
                  <Avatar className="h-8 w-8 border border-border">
                    {user.avatarUrl && (
                      <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                    )}
                    <AvatarFallback className="bg-accent-purple text-xs font-semibold text-white">
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3.5 w-3.5 text-text-muted hidden sm:block" />
                </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-52 bg-bg-secondary border-border"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-text-secondary text-xs font-normal">
                    {user.email}
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-text-primary hover:bg-bg-elevated"
                    onClick={() => router.push("/profiles")}
                  >
                    <UserCircle2 className="h-4 w-4" />
                    Switch Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-text-primary hover:bg-bg-elevated"
                    onClick={() => router.push("/profiles/manage")}
                  >
                    <User className="h-4 w-4" />
                    Manage Profiles
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-text-primary hover:bg-bg-elevated"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-accent-red hover:bg-bg-elevated"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              className="bg-gradient-purple-btn text-white"
              onClick={() => router.push("/login")}
            >
              Sign In
            </Button>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-text-secondary hover:text-text-primary lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* ─── Mobile slide-down nav ──────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden animate-slide-down border-t border-[rgba(255,200,120,0.12)] liquid-glass-dark">
          <ul className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent-purple/10 text-accent-purple-light"
                        : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
