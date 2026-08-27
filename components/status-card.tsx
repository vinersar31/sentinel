
"use client";

import { CheckNowButton } from "@/components/check-now-button";
import { formatPercent } from "@/lib/format";
import type { Check, Site, SiteStatus } from "@/lib/types";
import { ResponseChart } from "@/components/response-chart";
import { Globe } from "lucide-react";
import { hostOf } from "@/lib/format";
import { useState } from "react";

export interface UptimeStat {
  label: string;
  value: number | null;
}

interface StatusCardProps {
  site: Site;
  status: SiteStatus | null;
  checks: Check[];
  uptime: UptimeStat[];
}

function Favicon({ url }: { url: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return <Globe className="size-4 text-muted-foreground" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://icons.duckduckgo.com/ip3/${hostOf(url)}.ico`}
      alt=""
      width={16}
      height={16}
      className="size-4 rounded"
      onError={() => setErrored(true)}
    />
  );
}

export function StatusCard({ site, status, checks, uptime }: StatusCardProps) {
  const up = status ? status.up : null;
  const isUp = up === true;
  const chartColor = up === false ? "#ef4444" : "#10b981";

  const uptime24h = uptime.find(u => u.label === "24h")?.value ?? null;
  const uptime7d = uptime.find(u => u.label === "7d")?.value ?? null;
  const uptime30d = uptime.find(u => u.label === "30d")?.value ?? null;

  return (
    <div className="bg-card text-card-foreground rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-border shadow-sm">
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {up === null ? (
            <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
          ) : isUp ? (
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
          )}
          <h3 className="font-semibold text-lg m-0 truncate flex items-center gap-2">
            <Favicon url={site.url} />
            <a href={site.url} target="_blank" rel="noreferrer" className="hover:underline">{site.name}</a>
          </h3>
        </div>
        <p className="text-muted-foreground font-mono text-sm m-0 truncate">{site.description || hostOf(site.url)}</p>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 flex-1 w-full justify-between md:justify-end">
        <div className="flex gap-4 font-mono text-sm text-muted-foreground">
          <div className="flex flex-col items-center">
            <span className={uptime24h === null ? "text-muted-foreground" : uptime24h >= 99 ? "text-emerald-500" : uptime24h >= 95 ? "text-amber-500" : "text-destructive"}>{formatPercent(uptime24h)}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-70">24h</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={uptime7d === null ? "text-muted-foreground" : uptime7d >= 99 ? "text-emerald-500" : uptime7d >= 95 ? "text-amber-500" : "text-destructive"}>{formatPercent(uptime7d)}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-70">7d</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={uptime30d === null ? "text-muted-foreground" : uptime30d >= 99 ? "text-emerald-500" : uptime30d >= 95 ? "text-amber-500" : "text-destructive"}>{formatPercent(uptime30d)}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-70">30d</span>
          </div>
        </div>

        <div className="w-[100px] h-10 hidden sm:block shrink-0">
          <ResponseChart checks={checks} color={chartColor} />
        </div>

        <CheckNowButton url={site.url} />
      </div>
    </div>
  );
}
