"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search, Shield, ShieldCheck, Ban, CheckCircle2, MoreVertical, UserCog,
} from "lucide-react";
import { Input, Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { cn, getInitials, formatDate } from "@/lib/utils";
import api from "@/lib/api";
import { getDemoUsers } from "@/lib/adminDemo";
import { toast } from "sonner";
import type { AdminUser } from "@/types/admin";
import type { Role } from "@/types/auth";

type RoleFilter = "ALL" | Role;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    api.get<AdminUser[]>("/api/admin/users")
      .then((res) => setUsers(res.data && res.data.length ? res.data : getDemoUsers()))
      .catch(() => setUsers(getDemoUsers()))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesQuery =
        u.displayName.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  const updateUser = (id: string, patch: Partial<AdminUser>) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const toggleSuspend = async (user: AdminUser) => {
    const next = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    updateUser(user.id, { status: next });
    setOpenMenu(null);
    try { await api.patch(`/api/admin/users/${user.id}`, { status: next }); }
    catch { toast.error("Couldn't update user"); updateUser(user.id, { status: user.status }); }
  };

  const toggleRole = async (user: AdminUser) => {
    const next: Role = user.role === "ADMIN" ? "USER" : "ADMIN";
    updateUser(user.id, { role: next });
    setOpenMenu(null);
    try { await api.patch(`/api/admin/users/${user.id}`, { role: next }); toast.success(`${user.displayName} is now ${next}`); }
    catch { toast.error("Couldn't change role"); updateUser(user.id, { role: user.role }); }
  };

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const suspendedCount = users.filter((u) => u.status === "SUSPENDED").length;

  return (
    <div className="px-4 md:px-8 py-8 lg:py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 pl-12 lg:pl-0">
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
        <p className="text-sm text-text-muted mt-1">
          {users.length} total · {adminCount} admin{adminCount !== 1 ? "s" : ""} · {suspendedCount} suspended
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9 bg-bg-secondary border-border text-text-primary"
          />
        </div>
        <div className="flex items-center gap-1 liquid-glass-sm rounded-xl p-1">
          {(["ALL", "USER", "ADMIN"] as RoleFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                roleFilter === r ? "bg-accent-purple text-white" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {r.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="liquid-glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_90px_90px_40px] md:grid-cols-[1fr_120px_100px_110px_110px_40px] gap-3 px-4 py-3 border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wide">
          <div>User</div>
          <div className="hidden md:block">Profiles</div>
          <div>Role</div>
          <div>Status</div>
          <div className="hidden md:block">Joined</div>
          <div></div>
        </div>

        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3 border-b border-border last:border-0">
              <div className="h-10 bg-bg-elevated rounded animate-pulse" />
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[1fr_90px_90px_40px] md:grid-cols-[1fr_120px_100px_110px_110px_40px] gap-3 px-4 py-3 border-b border-border last:border-0 items-center hover:bg-bg-elevated/50 transition-colors"
            >
              {/* User */}
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9 flex-shrink-0 border border-border">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
                  <AvatarFallback className="bg-accent-purple text-xs font-semibold text-white">
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary line-clamp-1">{user.displayName}</p>
                  <p className="text-[11px] text-text-muted line-clamp-1">{user.email}</p>
                </div>
              </div>

              <div className="hidden md:block">
                <span className="text-xs text-text-secondary">{user.profileCount} profile{user.profileCount !== 1 ? "s" : ""}</span>
              </div>

              {/* Role */}
              <div>
                <span className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full",
                  user.role === "ADMIN"
                    ? "bg-accent-purple/20 text-accent-purple-light"
                    : "bg-text-muted/15 text-text-secondary"
                )}>
                  {user.role === "ADMIN" ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                  {user.role}
                </span>
              </div>

              {/* Status */}
              <div>
                <span className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full",
                  user.status === "ACTIVE"
                    ? "bg-accent-green/15 text-accent-green"
                    : "bg-accent-red/15 text-accent-red"
                )}>
                  {user.status === "ACTIVE" ? <CheckCircle2 className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                  {user.status}
                </span>
              </div>

              <div className="hidden md:block">
                <span className="text-xs text-text-muted">{formatDate(user.createdAt)}</span>
              </div>

              {/* Menu */}
              <div className="relative flex justify-end">
                <button
                  onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {openMenu === user.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                    <div className="absolute right-0 top-6 z-20 liquid-glass rounded-xl py-1 w-44 animate-scale-in">
                      <button
                        onClick={() => toggleRole(user)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-white/8 transition-colors"
                      >
                        <UserCog className="h-3.5 w-3.5" />
                        {user.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                      </button>
                      <button
                        onClick={() => toggleSuspend(user)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/8 transition-colors",
                          user.status === "ACTIVE" ? "text-accent-red" : "text-accent-green"
                        )}
                      >
                        {user.status === "ACTIVE"
                          ? <><Ban className="h-3.5 w-3.5" /> Suspend</>
                          : <><CheckCircle2 className="h-3.5 w-3.5" /> Reactivate</>}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center">
            <p className="text-text-secondary text-sm">No users match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}