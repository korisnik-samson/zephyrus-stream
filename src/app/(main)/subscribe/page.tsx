"use client";

import { useState, useEffect } from "react";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/plans";
import api from "@/lib/api";
import { toast } from "sonner";
import type { BillingInterval, PlanTier, Subscription } from "@/types/billing";

export default function SubscribePage() {
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const [current, setCurrent] = useState<Subscription | null>(null);

  useEffect(() => {
    api.get<Subscription>("/api/billing/subscription")
      .then((r) => setCurrent(r.data ?? null))
      .catch(() => {});
  }, []);

  const handleCheckout = async (tier: PlanTier) => {
    setLoadingTier(tier);
    try {
      // Backend creates a Stripe Checkout Session and returns its URL
      const res = await api.post<{ url: string }>("/api/billing/checkout", {
        tier,
        interval,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Couldn't start checkout");
      }
    } catch {
      toast.error("Checkout is unavailable. Is the billing service running?");
    } finally {
      setLoadingTier(null);
    }
  };

  const yearlyDiscount = (monthly: number, yearly: number) =>
    Math.round((1 - yearly / (monthly * 12)) * 100);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Choose your plan
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            Watch all you want. Cancel anytime. Upgrade or downgrade whenever you like.
          </p>
        </div>

        {/* Interval toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={cn("text-sm font-medium", interval === "month" ? "text-text-primary" : "text-text-muted")}>
            Monthly
          </span>
          <button
            onClick={() => setInterval((i) => (i === "month" ? "year" : "month"))}
            className={cn(
              "relative w-12 h-6 rounded-full transition-colors",
              interval === "year" ? "bg-accent-purple" : "bg-bg-elevated border border-border"
            )}
            aria-label="Toggle billing interval"
          >
            <span className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform",
              interval === "year" && "translate-x-6"
            )} />
          </button>
          <span className={cn("text-sm font-medium", interval === "year" ? "text-text-primary" : "text-text-muted")}>
            Yearly
            <span className="ml-1.5 text-[10px] font-bold bg-accent-green/20 text-accent-green px-1.5 py-0.5 rounded-full">
              SAVE ~16%
            </span>
          </span>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const price = interval === "month" ? plan.priceMonthly : plan.priceYearly;
            const isCurrent = current?.tier === plan.tier && current.status === "active";
            const loading = loadingTier === plan.tier;

            return (
              <div
                key={plan.tier}
                className={cn(
                  "relative rounded-2xl p-6 flex flex-col",
                  plan.highlighted
                    ? "liquid-glass ring-1 ring-accent-purple/40 shadow-glow-purple"
                    : "bg-bg-card border border-border"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gradient-purple-btn text-white text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                )}

                <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
                <p className="text-xs text-text-muted mb-4">{plan.tagline}</p>

                <div className="mb-1 flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-text-primary">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-sm text-text-muted mb-1">/{interval}</span>
                </div>
                {interval === "year" && (
                  <p className="text-xs text-accent-green mb-4">
                    Save {yearlyDiscount(plan.priceMonthly, plan.priceYearly)}% vs monthly
                  </p>
                )}
                {interval === "month" && <div className="mb-4" />}

                <div className="text-xs font-semibold text-accent-gold-light mb-4">
                  {plan.resolution}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Check className="h-4 w-4 text-accent-green flex-shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.tier)}
                  disabled={loading || isCurrent}
                  className={cn(
                    "w-full h-11 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                    isCurrent
                      ? "bg-bg-elevated text-text-muted cursor-default"
                      : plan.highlighted
                        ? "bg-gradient-purple-btn text-white shadow-glow-purple hover:shadow-glow-purple-lg"
                        : "liquid-glass-sm text-text-primary hover:text-accent-gold-light"
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Manage existing subscription */}
        {current && current.status === "active" && (
          <div className="mt-8 text-center">
            <ManagePortalButton />
          </div>
        )}

        <p className="text-center text-xs text-text-muted mt-8">
          Payments are processed securely by Stripe. Prices shown in USD.
        </p>
      </div>
    </div>
  );
}

function ManagePortalButton() {
  const [loading, setLoading] = useState(false);
  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await api.post<{ url: string }>("/api/billing/portal");
      if (res.data?.url) window.location.href = res.data.url;
      else toast.error("Couldn't open billing portal");
    } catch {
      toast.error("Billing portal unavailable");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm text-accent-purple-light hover:text-accent-purple transition-colors"
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      Manage billing & cancel subscription →
    </button>
  );
}
