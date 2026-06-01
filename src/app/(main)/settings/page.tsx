"use client";

import Link from "next/link";
import {
  CreditCard, ShieldCheck, Subtitles, Contrast, Zap,
  Globe, ChevronRight, User, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { LOCALES, setLocaleCookie } from "@/lib/i18n-config";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const {
    highContrast, reduceMotion, locale,
    setHighContrast, setReduceMotion, setLocale,
  } = usePreferencesStore();

  const handleLocaleChange = (next: string) => {
    setLocale(next);
    setLocaleCookie(next);
    // Reload so server components re-render with new messages
    window.location.reload();
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-4 md:px-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Settings</h1>

        {/* Account summary */}
        {user && (
          <div className="liquid-glass rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-accent-purple flex items-center justify-center text-white font-bold">
              {user.displayName?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary">{user.displayName}</p>
              <p className="text-sm text-text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <div className="space-y-2 mb-6">
          <SettingsLink href="/profiles/manage" icon={User} label="Manage Profiles" description="Create, edit, and delete profiles" />
          <SettingsLink href="/subscribe" icon={CreditCard} label="Subscription & Billing" description="Change plan, payment, and invoices" />
          <SettingsLink href="/settings/parental-controls" icon={ShieldCheck} label="Parental Controls" description="PIN protection and maturity limits" />
          <SettingsLink href="/settings/captions" icon={Subtitles} label="Caption Styling" description="Customize subtitle appearance" />
        </div>

        {/* Accessibility */}
        <section className="liquid-glass rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-bold text-text-primary mb-4">Accessibility</h2>

          <ToggleRow
            icon={Contrast}
            label="High Contrast"
            description="Boost contrast for better readability"
            checked={highContrast}
            onChange={setHighContrast}
          />
          <div className="h-px bg-border my-3" />
          <ToggleRow
            icon={Zap}
            label="Reduce Motion"
            description="Minimize animations and transitions"
            checked={reduceMotion}
            onChange={setReduceMotion}
          />
        </section>

        {/* Language */}
        <section className="liquid-glass rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-accent-blue-light" />
            <h2 className="text-sm font-bold text-text-primary">Language</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => handleLocaleChange(l.code)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                  locale === l.code
                    ? "border-accent-purple bg-accent-purple/10 text-text-primary"
                    : "border-border bg-bg-card text-text-secondary hover:border-border-hover hover:text-text-primary"
                )}
              >
                <span className="text-base">{l.flag}</span>
                {l.label}
              </button>
            ))}
          </div>
        </section>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-accent-red/30 text-accent-red hover:bg-accent-red/10 transition-colors text-sm font-medium"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function SettingsLink({ href, icon: Icon, label, description }: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 rounded-2xl bg-bg-card border border-border hover:border-border-hover transition-colors group"
    >
      <div className="h-10 w-10 rounded-xl bg-bg-elevated flex items-center justify-center text-accent-purple-light flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-text-primary transition-colors" />
    </Link>
  );
}

function ToggleRow({ icon: Icon, label, description, checked, onChange }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-text-muted flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-12 h-6 rounded-full transition-colors flex-shrink-0",
          checked ? "bg-accent-purple" : "bg-bg-elevated border border-border"
        )}
      >
        <span className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform",
          checked && "translate-x-6"
        )} />
      </button>
    </div>
  );
}