"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Check } from "lucide-react";
import PinEntry from "@/components/settings/PinEntry";
import { cn } from "@/lib/utils";
import { MATURITY_RATINGS } from "@/lib/constants";
import api from "@/lib/api";
import { toast } from "sonner";

// Maturity tiers grouped for the slider-style selector
const MATURITY_TIERS = [
  { label: "Little Kids", value: "TV-Y",  ratings: ["TV-Y", "TV-G", "G"] },
  { label: "Older Kids",  value: "TV-Y7", ratings: ["TV-Y7", "TV-PG", "PG"] },
  { label: "Teens",       value: "TV-14", ratings: ["TV-14", "PG-13"] },
  { label: "Adults",      value: "TV-MA", ratings: ["TV-MA", "R", "NC-17"] },
];

export default function ParentalControlsPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [maturityTier, setMaturityTier] = useState(3); // index into MATURITY_TIERS
  const [requirePinToPlay, setRequirePinToPlay] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePin = async (pin: string) => {
    try {
      const res = await api.post<{ valid: boolean }>("/api/parental/verify-pin", { pin });
      if (res.data?.valid) {
        setUnlocked(true);
        return;
      }
      throw new Error();
    } catch {
      // Demo fallback: accept 0000 when backend is offline
      if (pin === "0000") { setUnlocked(true); return; }
      setPinError(true);
      setResetKey((k) => k + 1);
      setTimeout(() => setPinError(false), 400);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/api/parental/settings", {
        maturityLevel: MATURITY_TIERS[maturityTier]!.value,
        requirePinToPlay,
      });
      toast.success("Parental controls updated");
    } catch {
      toast.error("Couldn't save settings");
    } finally {
      setSaving(false);
    }
  };

  // ── Lock screen ───────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="liquid-glass rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="h-14 w-14 rounded-2xl bg-accent-purple/15 flex items-center justify-center mx-auto mb-5">
            <Lock className="h-6 w-6 text-accent-purple-light" />
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-1">Enter your PIN</h1>
          <p className="text-sm text-text-muted mb-6">
            Parental controls are protected by a 4-digit PIN
          </p>
          <PinEntry onComplete={handlePin} error={pinError} resetKey={resetKey} />
          {pinError && (
            <p className="text-xs text-accent-red mt-3">Incorrect PIN. Try again.</p>
          )}
          <p className="text-[11px] text-text-muted mt-6">
            Forgot your PIN? Reset it from account settings.
          </p>
        </div>
      </div>
    );
  }

  // ── Settings ──────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-4 md:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/settings" className="text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent-green" />
            <h1 className="text-2xl font-bold text-text-primary">Parental Controls</h1>
          </div>
        </div>

        {/* Maturity rating selector */}
        <div className="liquid-glass rounded-2xl p-6 mb-5">
          <h2 className="text-base font-bold text-text-primary mb-1">Maturity Rating</h2>
          <p className="text-sm text-text-muted mb-5">
            Allow titles rated up to the selected level for this profile.
          </p>

          {/* Tier selector */}
          <div className="space-y-2">
            {MATURITY_TIERS.map((tier, i) => (
              <button
                key={tier.value}
                onClick={() => setMaturityTier(i)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                  i <= maturityTier
                    ? "border-accent-purple/40 bg-accent-purple/10"
                    : "border-border bg-bg-card hover:border-border-hover"
                )}
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-text-primary">{tier.label}</p>
                  <p className="text-xs text-text-muted">{tier.ratings.join(", ")}</p>
                </div>
                <div className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                  i <= maturityTier ? "border-accent-purple bg-accent-purple" : "border-border"
                )}>
                  {i <= maturityTier && <Check className="h-3 w-3 text-white" />}
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-text-muted mt-4">
            Currently allowing: titles rated <span className="text-accent-gold-light font-medium">{MATURITY_TIERS[maturityTier]!.label}</span> and below.
          </p>
        </div>

        {/* Require PIN toggle */}
        <div className="liquid-glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Require PIN to play</h2>
              <p className="text-sm text-text-muted mt-0.5">
                Ask for the PIN before playing mature content
              </p>
            </div>
            <button
              onClick={() => setRequirePinToPlay((v) => !v)}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors flex-shrink-0",
                requirePinToPlay ? "bg-accent-purple" : "bg-bg-elevated border border-border"
              )}
            >
              <span className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                requirePinToPlay && "translate-x-6"
              )} />
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-11 rounded-xl bg-gradient-purple-btn text-white text-sm font-semibold flex items-center justify-center"
        >
          {saving ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : "Save Changes"}
        </button>

        <p className="text-center text-[11px] text-text-muted mt-4">
          {MATURITY_RATINGS.length} maturity ratings supported · Demo PIN: 0000
        </p>
      </div>
    </div>
  );
}