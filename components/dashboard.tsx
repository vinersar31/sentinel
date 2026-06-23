"use client";

import { Activity } from "lucide-react";

import { IncidentList } from "@/components/incident-list";
import { RelativeTime } from "@/components/relative-time";
import { StatusCard, type UptimeStat } from "@/components/status-card";
import { SummaryBar } from "@/components/summary-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Check, Incident, Site, SiteStatus } from "@/lib/types";

export interface SiteView {
  site: Site;
  status: SiteStatus | null;
  checks: Check[];
  uptime: UptimeStat[];
}

interface DashboardProps {
  sites: SiteView[];
  generatedAt: string;
  incidents: Incident[];
}

export function Dashboard({ sites, generatedAt, incidents }: DashboardProps) {
  const total = sites.length;
  const operational = sites.filter((s) => s.status?.up).length;

  const latencies = sites
    .map((s) => s.status?.responseTimeMs)
    .filter((n): n is number => typeof n === "number");
  const avgMs = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : null;

  const uptimes30 = sites
    .map((s) => s.uptime.find((u) => u.label === "30d")?.value ?? null)
    .filter((n): n is number => typeof n === "number");
  const overallUptime = uptimes30.length
    ? uptimes30.reduce((a, b) => a + b, 0) / uptimes30.length
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/25">
            <Activity className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Sentinel</h1>
            <p className="text-sm text-muted-foreground">
              Monitoring {total} {total === 1 ? "app" : "apps"} ·{" "}
              <span className="whitespace-nowrap">
                updated <RelativeTime iso={generatedAt || null} />
              </span>
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <section className="mb-8">
        <SummaryBar
          operational={operational}
          total={total}
          avgMs={avgMs}
          overallUptime={overallUptime}
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Applications
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {sites.map((s) => (
            <StatusCard
              key={s.site.id}
              site={s.site}
              status={s.status}
              checks={s.checks}
              uptime={s.uptime}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Incident history
        </h2>
        <IncidentList incidents={incidents} />
      </section>

      <footer className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
        Health checks run hourly via GitHub Actions. &ldquo;Check now&rdquo;
        performs a live ping from your browser.
      </footer>
    </div>
  );
}
