
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
    <div className="min-h-screen flex flex-col font-sans text-base">
      {/* TopAppBar */}
      <header className="bg-background text-foreground fixed top-0 w-full z-50 flex justify-between items-center px-6 py-2 max-w-6xl mx-auto border-b border-border backdrop-blur-md bg-opacity-80 left-0 right-0">
        <div className="flex items-center gap-4">
          <Activity className="size-6 text-foreground" />
          <span className="font-bold text-2xl tracking-tight">Sentinel</span>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 lg:px-6 pt-[120px] pb-10 flex flex-col gap-10">

        <section className="mb-4">
          <SummaryBar
            operational={operational}
            total={total}
            avgMs={avgMs}
            overallUptime={overallUptime}
          />
        </section>

        {/* Application Cards */}
        <section className="flex flex-col gap-4">
          {sites.map((s) => (
            <StatusCard
              key={s.site.id}
              site={s.site}
              status={s.status}
              checks={s.checks}
              uptime={s.uptime}
            />
          ))}
        </section>

        {/* Incident History Section */}
        <section className="flex flex-col gap-6 pt-6">
          <h2 className="font-semibold text-xl m-0 border-b border-border pb-2">Incident History</h2>
          <IncidentList incidents={incidents} />
        </section>

        <footer className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
          Health checks run hourly via GitHub Actions. &ldquo;Check now&rdquo; performs a live ping from your browser.<br/>
          Updated <RelativeTime iso={generatedAt || null} />
        </footer>
      </main>
    </div>
  );
}
