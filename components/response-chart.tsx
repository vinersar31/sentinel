"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

import type { Check } from "@/lib/types";

/** Compact response-time sparkline for the most recent checks. */
export function ResponseChart({
  checks,
  color = "#10b981",
}: {
  checks: Check[];
  color?: string;
}) {
  const data = checks
    .filter((c) => c.ms !== null)
    .slice(-48)
    .map((c) => ({ t: c.t, ms: c.ms as number }));

  if (data.length < 2) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
        Not enough data yet
      </div>
    );
  }

  const gradientId = `spark-${color.replace("#", "")}`;

  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin - 20", "dataMax + 40"]} />
          <Tooltip
            isAnimationActive={false}
            cursor={{ stroke: "var(--border)" }}
            labelFormatter={() => ""}
            formatter={(value) => [`${value} ms`, "Response"] as [string, string]}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              padding: "4px 8px",
              color: "var(--popover-foreground)",
            }}
          />
          <Area
            type="monotone"
            dataKey="ms"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
