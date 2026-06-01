import { Users, UserCheck, Clapperboard, Eye, TrendingUp } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { ViewsAreaChart, GenrePieChart } from "@/components/admin/AnalyticsCharts";
import { cn, formatNumber } from "@/lib/utils";
import api from "@/lib/api";
import { getDemoAnalytics } from "@/lib/adminDemo";
import type { AdminAnalytics } from "@/types/admin";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  let analytics: AdminAnalytics;
  try {
    const res = await api.get<AdminAnalytics>("/api/admin/analytics");
    analytics = res.data ?? getDemoAnalytics();
  } catch {
    analytics = getDemoAnalytics();
  }

  const { stats, viewsOverTime, genreDistribution, topTitles } = analytics;

  return (
    <div className="px-4 md:px-8 py-8 lg:py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 pl-12 lg:pl-0">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">
          Platform overview and analytics for the last 30 days
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users"  value={stats.totalUsers}  change={stats.usersChange}  icon={Users}        accent="text-accent-purple-light" />
        <StatCard label="Active Users" value={stats.activeUsers} change={stats.activeChange} icon={UserCheck}    accent="text-accent-green" />
        <StatCard label="Total Titles" value={stats.totalTitles} change={stats.titlesChange} icon={Clapperboard} accent="text-accent-blue-light" />
        <StatCard label="Total Views"  value={stats.totalViews}  change={stats.viewsChange}  icon={Eye}          accent="text-accent-gold" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Views over time */}
        <div className="lg:col-span-2 liquid-glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text-primary">Views & Signups</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-text-muted">
                <span className="h-2 w-2 rounded-full bg-accent-gold-light" /> Views
              </span>
              <span className="flex items-center gap-1.5 text-text-muted">
                <span className="h-2 w-2 rounded-full bg-accent-blue" /> Signups
              </span>
            </div>
          </div>
          <ViewsAreaChart data={viewsOverTime} />
        </div>

        {/* Genre distribution */}
        <div className="liquid-glass rounded-2xl p-5">
          <h2 className="text-sm font-bold text-text-primary mb-4">Content by Genre</h2>
          <GenrePieChart data={genreDistribution} />
        </div>
      </div>

      {/* Top titles */}
      <div className="liquid-glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-accent-gold" />
          <h2 className="text-sm font-bold text-text-primary">Top Performing Titles</h2>
        </div>
        <div className="space-y-1">
          {topTitles.map((title, i) => (
            <div
              key={title.id}
              className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-bg-elevated transition-colors"
            >
              <span className="text-sm font-bold text-text-muted w-5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary line-clamp-1">{title.title}</p>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded",
                  title.mediaType === "SERIES"
                    ? "bg-accent-purple/20 text-accent-purple-light"
                    : "bg-accent-blue/20 text-accent-blue-light"
                )}>
                  {title.mediaType}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-text-primary">{formatNumber(title.views)}</p>
                <p className="text-[11px] text-text-muted">views</p>
              </div>
              <div className="w-28 hidden sm:block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-text-muted">Avg watch</span>
                  <span className="text-[10px] text-text-secondary">{title.avgWatchPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${title.avgWatchPercent}%`,
                      background: "linear-gradient(to right, #c2410c, #fb923c)",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}