import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  change: number;
  icon: LucideIcon;
  accent?: string;
}

export default function StatCard({ label, value, change, icon: Icon, accent = "text-accent-purple-light" }: StatCardProps) {
  const positive = change >= 0;
  return (
    <div className="liquid-glass rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("h-10 w-10 rounded-xl bg-bg-elevated flex items-center justify-center", accent)}>
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={cn(
            "flex items-center gap-0.5 text-xs font-semibold",
            positive ? "text-accent-green" : "text-accent-red"
          )}
        >
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      <p className="text-2xl font-bold text-text-primary">{formatNumber(value)}</p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
    </div>
  );
}