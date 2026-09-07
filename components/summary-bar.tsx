import { Activity, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

import { formatPercent } from "@/lib/format";

interface SummaryBarProps {
  operational: number;
  total: number;
  activeIncidents: number;
  overallUptime: number | null;
}

export function SummaryBar({
  operational,
  total,
  activeIncidents,
  overallUptime,
}: SummaryBarProps) {
  const allUp = operational === total;
  const hasActiveIncidents = activeIncidents > 0;

  const stats = [
    {
      label: "Operational",
      value: `${operational}/${total} Apps`,
      icon: ShieldCheck,
      tone: allUp
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Active Incidents",
      value: hasActiveIncidents
        ? `${activeIncidents} Active`
        : "None",
      icon: hasActiveIncidents ? AlertCircle : CheckCircle2,
      tone: hasActiveIncidents
        ? "text-rose-600 dark:text-rose-400"
        : "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Uptime (30d)",
      value: formatPercent(overallUptime),
      icon: Activity,
      tone: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <s.icon className="size-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`text-lg font-semibold tabular-nums ${s.tone}`}>
              {s.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
