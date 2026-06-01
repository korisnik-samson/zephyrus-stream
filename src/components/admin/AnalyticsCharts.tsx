"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import type { TimeSeriesPoint, GenreDistribution } from "@/types/admin";

const PIE_COLORS = [
  "#c2410c", "#fb923c", "#fed7aa", "#f59e0b", "#3b82f6",
  "#22c55e", "#a855f7", "#ef4444", "#06b6d4", "#ec4899",
];

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="liquid-glass rounded-lg px-3 py-2 text-xs">
      {label && <p className="text-text-primary font-semibold mb-1">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="capitalize">
          {entry.name}: <span className="font-medium">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

export function ViewsAreaChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#fb923c" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="signupsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="date" stroke="#7a6850" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#7a6850" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="views" stroke="#fb923c" strokeWidth={2} fill="url(#viewsGrad)" />
        <Area type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2} fill="url(#signupsGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function GenrePieChart({ data }: { data: GenreDistribution[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="genre"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="middle"
          align="right"
          layout="vertical"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: "#c8b49a" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}