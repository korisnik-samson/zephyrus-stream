export type PlanTier = "BASIC" | "STANDARD" | "PREMIUM";
export type BillingInterval = "month" | "year";
export type SubscriptionStatus =
  | "active" | "trialing" | "past_due" | "canceled" | "none";

export interface Plan {
  tier: PlanTier;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  resolution: string;
  maxStreams: number;
  downloads: boolean;
  features: string[];
  highlighted?: boolean;
}

export interface Subscription {
  status: SubscriptionStatus;
  tier: PlanTier | null;
  interval: BillingInterval;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}