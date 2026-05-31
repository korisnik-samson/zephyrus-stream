"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { AVATAR_COLORS, MAX_PROFILES } from "@/lib/constants";
import { useAuthStore } from "@/stores/authStore";
import { getBlurDataUrl } from "@/lib/utils";
import type { Profile } from "@/types/auth";

interface ProfileSwitcherProps {
  profiles: Profile[];
}

function getAvatarColor(profileId: string): string {
  let hash = 0;
  for (let i = 0; i < profileId.length; i++) {
    hash = (hash << 5) - hash + profileId.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] as string;
}

export default function ProfileSwitcher({ profiles }: ProfileSwitcherProps) {
  const router = useRouter();
  const { setActiveProfile } = useAuthStore();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (profile: Profile) => {
    setSelected(profile.id);
    setActiveProfile(profile);
    setTimeout(() => router.push("/"), 300);
  };

  return (
    /* Full-screen takeover rendered above Navbar via fixed + z-50 */
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed top-1/4 -left-40 w-[32rem] h-[32rem] bg-accent-purple/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-40 w-[32rem] h-[32rem] bg-accent-gold/8 rounded-full blur-[160px] pointer-events-none" />

      {/* Logo */}
      <p className="text-2xl font-extrabold tracking-[0.2em] text-gradient-purple mb-10 select-none">
        ZEPHYRUS
      </p>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
        Who&apos;s watching?
      </h1>

      {/* Profile grid */}
      <div className="flex flex-wrap items-start justify-center gap-6 max-w-3xl px-4">
        {profiles.map((profile) => {
          const isSelected = selected === profile.id;
          const color = getAvatarColor(profile.id);

          return (
            <button
              key={profile.id}
              onClick={() => handleSelect(profile)}
              className="group flex flex-col items-center gap-3 focus:outline-none"
            >
              <div
                className={cn(
                  "relative w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden transition-all duration-200",
                  "ring-2 ring-transparent group-hover:ring-accent-purple group-focus-visible:ring-accent-purple",
                  "group-hover:scale-105 group-hover:shadow-glow-purple",
                  isSelected && "ring-accent-gold scale-105 shadow-glow-gold"
                )}
              >
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.name}
                    fill
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={getBlurDataUrl()}
                    sizes="144px"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-white select-none"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                  >
                    {getInitials(profile.name)}
                  </div>
                )}

                {/* Kids badge */}
                {profile.isKids && (
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-accent-blue text-white px-2 py-0.5 rounded-full">
                    KIDS
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isSelected ? "text-accent-gold-light" : "text-white/60 group-hover:text-white"
                )}
              >
                {profile.name}
              </span>
            </button>
          );
        })}

        {/* Add profile */}
        {profiles.length < MAX_PROFILES && (
          <Link
            href="/profiles/manage"
            className="group flex flex-col items-center gap-3 focus:outline-none"
          >
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl border-2 border-dashed border-white/15 group-hover:border-accent-purple/60 flex items-center justify-center transition-all duration-200 group-hover:scale-105">
              <Plus className="h-10 w-10 text-white/25 group-hover:text-accent-purple-light transition-colors" />
            </div>
            <span className="text-sm font-medium text-white/30 group-hover:text-white/70 transition-colors">
              Add Profile
            </span>
          </Link>
        )}
      </div>

      {/* Manage profiles */}
      <Link
        href="/profiles/manage"
        className="mt-12 flex items-center gap-2 liquid-glass-sm px-6 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors"
      >
        <Pencil className="h-4 w-4" />
        Manage Profiles
      </Link>
    </div>
  );
}