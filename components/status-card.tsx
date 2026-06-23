"use client";

import { useState, type ReactNode } from "react";
import { Globe } from "lucide-react";

import { CheckNowButton } from "@/components/check-now-button";
import { RelativeTime } from "@/components/relative-time";
import { ResponseChart } from "@/components/response-chart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMs, formatPercent, hostOf } from "@/lib/format";
import type { Check, Site, SiteStatus } from "@/lib/types";

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

function StatusBadge({ up }: { up: boolean | null }) {
  if (up === null) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <span className="size-1.5 rounded-full bg-muted-foreground" />
        Unknown
      </Badge>
    );
  }
  if (up) {
    return (
      <Badge className="gap-1.5 border-emerald-500/20 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
        Operational
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1.5">
      <span className="size-1.5 rounded-full bg-destructive" />
      Down
    </Badge>
  );
}

function uptimeTone(v: number | null): string {
  if (v === null) return "text-muted-foreground";
  if (v >= 99) return "text-emerald-600 dark:text-emerald-400";
  if (v >= 95) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function Favicon({ url }: { url: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return <Globe className="size-5 text-muted-foreground" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://icons.duckduckgo.com/ip3/${hostOf(url)}.ico`}
      alt=""
      width={20}
      height={20}
      className="size-5 rounded"
      onError={() => setErrored(true)}
    />
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-1.5">
      <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="font-medium tabular-nums">{value}</div>
    </div>
  );
}

export function StatusCard({ site, status, checks, uptime }: StatusCardProps) {
  const up = status ? status.up : null;
  const chartColor = up === false ? "#ef4444" : "#10b981";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Favicon url={site.url} />
          </div>
          <div>
            <CardTitle>
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {site.name}
              </a>
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              {hostOf(site.url)}
            </div>
          </div>
        </div>
        <StatusBadge up={up} />
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Metric label="Response" value={formatMs(status?.responseTimeMs ?? null)} />
          <Metric
            label="HTTP"
            value={status?.statusCode != null ? String(status.statusCode) : "—"}
          />
          <Metric
            label="Checked"
            value={<RelativeTime iso={status?.checkedAt ?? null} />}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {uptime.map((u) => (
            <div
              key={u.label}
              title={`Uptime over the last ${u.label}`}
              className="rounded-lg bg-muted/50 px-2 py-1.5 text-center"
            >
              <div className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                {u.label}
              </div>
              <div
                className={`text-sm font-semibold tabular-nums ${uptimeTone(u.value)}`}
              >
                {formatPercent(u.value)}
              </div>
            </div>
          ))}
        </div>

        <ResponseChart checks={checks} color={chartColor} />
      </CardContent>

      <CardFooter className="justify-between">
        <CheckNowButton url={site.url} />
        <a
          href={site.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Open ↗
        </a>
      </CardFooter>
    </Card>
  );
}
