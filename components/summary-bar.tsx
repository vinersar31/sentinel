
import { formatMs, formatPercent } from "@/lib/format";

interface SummaryBarProps {
  operational: number;
  total: number;
  avgMs: number | null;
  overallUptime: number | null;
}

export function SummaryBar({
  operational,
  total,
  avgMs,
  overallUptime,
}: SummaryBarProps) {
  const allUp = operational === total;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-sm text-muted-foreground bg-muted/10 p-4 rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${allUp ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"}`}></div>
        <span>{operational}/{total} apps operational</span>
      </div>
      <div className="flex gap-4">
        <span>avg latency: <span className="text-foreground">{formatMs(avgMs)}</span></span>
        <span className="hidden sm:inline">|</span>
        <span>30-day uptime: <span className="text-foreground">{formatPercent(overallUptime)}</span></span>
      </div>
    </div>
  );
}
