import type { Plan } from "@/types/billing";

export const PLANS: Plan[] = [
  {
    tier: "BASIC",
    name: "Basic",
    tagline: "Great for solo watching",
    priceMonthly: 6.99,
    priceYearly: 69.99,
    resolution: "720p HD",
    maxStreams: 1,
    downloads: false,
    features: [
      "Watch on 1 device at a time",
      "720p HD streaming",
      "Ad-free experience",
      "Access to full catalog",
    ],
  },
  {
    tier: "STANDARD",
    name: "Standard",
    tagline: "Perfect for couples & small families",
    priceMonthly: 12.99,
    priceYearly: 129.99,
    resolution: "1080p Full HD",
    maxStreams: 2,
    downloads: true,
    highlighted: true,
    features: [
      "Watch on 2 devices at a time",
      "1080p Full HD streaming",
      "Download on 2 devices",
      "Ad-free experience",
      "Access to full catalog",
    ],
  },
  {
    tier: "PREMIUM",
    name: "Premium",
    tagline: "The ultimate experience",
    priceMonthly: 18.99,
    priceYearly: 189.99,
    resolution: "4K Ultra HD + HDR",
    maxStreams: 4,
    downloads: true,
    features: [
      "Watch on 4 devices at a time",
      "4K Ultra HD + HDR",
      "Spatial audio",
      "Download on 6 devices",
      "Watch Party hosting",
      "Early access to originals",
    ],
  },
];

export function getPlan(tier: string): Plan | undefined {
  return PLANS.find((p) => p.tier === tier);
}