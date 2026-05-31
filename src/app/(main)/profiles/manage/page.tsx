"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, Plus, Pencil, Trash2, Check, X, UserCircle2,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { cn, getInitials } from "@/lib/utils";
import { AVATAR_COLORS, MAX_PROFILES } from "@/lib/constants";
import { useAuthStore } from "@/stores/authStore";
import { getBlurDataUrl } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import type { Profile } from "@/types/auth";

export default function ManageProfilesPage() {
  const router = useRouter();
  const { activeProfile, setActiveProfile } = useAuthStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState(AVATAR_COLORS[0] as string);
  const [formKids, setFormKids] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Profile[]>("/api/profiles")
      .then((res) => setProfiles(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startCreate = () => {
    setFormName("");
    setFormColor(AVATAR_COLORS[0] as string);
    setFormKids(false);
    setEditingId(null);
    setCreating(true);
  };

  const startEdit = (profile: Profile) => {
    setFormName(profile.name);
    setFormColor((profile.avatarUrl as string | null) ?? (AVATAR_COLORS[0] as string));
    setFormKids(profile.isKids);
    setCreating(false);
    setEditingId(profile.id);
  };

  const cancelForm = () => {
    setCreating(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formName.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      if (creating) {
        const res = await api.post<Profile>("/api/profiles", {
          name: formName.trim(),
          avatarColor: formColor,
          isKids: formKids,
        });
        if (res.data) setProfiles((p) => [...p, res.data!]);
        toast.success("Profile created");
      } else if (editingId) {
        const res = await api.put<Profile>(`/api/profiles/${editingId}`, {
          name: formName.trim(),
          avatarColor: formColor,
          isKids: formKids,
        });
        if (res.data) {
          setProfiles((p) => p.map((pr) => (pr.id === editingId ? res.data! : pr)));
          if (activeProfile?.id === editingId) setActiveProfile(res.data);
        }
        toast.success("Profile updated");
      }
      cancelForm();
    } catch {
      toast.error("Couldn't save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (profiles.length <= 1) { toast.error("You need at least one profile"); return; }
    setDeletingId(null);
    try {
      await api.delete(`/api/profiles/${id}`);
      setProfiles((p) => p.filter((pr) => pr.id !== id));
      if (activeProfile?.id === id) setActiveProfile(null);
      toast.success("Profile deleted");
    } catch {
      toast.error("Couldn't delete profile");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.push("/profiles")}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-text-primary">Manage Profiles</h1>
        </div>

        {/* Profile list */}
        <div className="space-y-3 mb-8">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-bg-card animate-pulse" />
              ))
            : profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-bg-card border border-border hover:border-border-hover transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden">
                    {profile.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt={profile.name}
                        fill
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL={getBlurDataUrl()}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-xl font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[Math.abs(profile.id.charCodeAt(0)) % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(Math.abs(profile.id.charCodeAt(0)) + 2) % AVATAR_COLORS.length]}cc)` }}
                      >
                        {getInitials(profile.name)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary">{profile.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {profile.isKids && (
                        <span className="text-[10px] font-bold bg-accent-blue text-white px-1.5 py-0.5 rounded-full">KIDS</span>
                      )}
                      {activeProfile?.id === profile.id && (
                        <span className="text-[10px] font-medium text-accent-gold-light">Active</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-text-muted hover:text-text-primary"
                      onClick={() => startEdit(profile)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {profiles.length > 1 && (
                      deletingId === profile.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(profile.id)}
                            className="text-xs text-accent-red hover:text-accent-red-light font-medium px-2 py-1"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="text-xs text-text-muted hover:text-text-primary px-2 py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-text-muted hover:text-accent-red"
                          onClick={() => setDeletingId(profile.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )
                    )}
                  </div>
                </div>
              ))}
        </div>

        {/* Create / Edit form */}
        {(creating || editingId) && (
          <div className="liquid-glass rounded-2xl p-6 mb-6 animate-scale-in">
            <h2 className="text-lg font-bold text-white mb-5">
              {creating ? "New Profile" : "Edit Profile"}
            </h2>

            {/* Name */}
            <div className="mb-4">
              <label className="text-xs font-medium text-text-muted mb-1.5 block">Name</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Profile name"
                maxLength={24}
                className="bg-bg-card border-border text-text-primary"
                autoFocus
              />
            </div>

            {/* Avatar color */}
            <div className="mb-4">
              <label className="text-xs font-medium text-text-muted mb-2 block">Avatar Color</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormColor(color)}
                    className={cn(
                      "w-9 h-9 rounded-xl transition-all",
                      formColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-bg-card scale-110" : "hover:scale-105"
                    )}
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                  >
                    {formColor === color && <Check className="h-4 w-4 text-white mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-bg-elevated">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${formColor}, ${formColor}cc)` }}
              >
                {formName ? getInitials(formName) : <UserCircle2 className="h-6 w-6 opacity-50" />}
              </div>
              <span className="text-sm text-text-primary font-medium">
                {formName || "Preview"}
              </span>
            </div>

            {/* Kids toggle */}
            <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-bg-elevated">
              <div>
                <p className="text-sm font-medium text-text-primary">Kids Profile</p>
                <p className="text-xs text-text-muted mt-0.5">Restricts content to age-appropriate titles</p>
              </div>
              <button
                onClick={() => setFormKids((k) => !k)}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors",
                  formKids ? "bg-accent-purple" : "bg-bg-card border border-border"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
                    formKids && "translate-x-5"
                  )}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-purple-btn text-white"
              >
                {saving ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : "Save Profile"}
              </Button>
              <Button variant="outline" onClick={cancelForm} className="border-border text-text-primary">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Add profile button */}
        {!creating && !editingId && profiles.length < MAX_PROFILES && (
          <button
            onClick={startCreate}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-accent-purple/50 text-text-muted hover:text-accent-purple-light transition-all"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">Add New Profile</span>
          </button>
        )}
      </div>
    </div>
  );
}