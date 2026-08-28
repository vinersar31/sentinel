import { Dashboard, type SiteView } from "@/components/dashboard";
import { sites } from "@/config/sites";
import { readAllHistory, readIncidents, readStatus } from "@/lib/data";
import { UPTIME_WINDOWS, computeUptime } from "@/lib/uptime";

// Monitoring data is read from `public/data/*.json` at build time, so each
// hourly redeploy bakes the latest snapshot into the static export.
export default async function Home() {
  const [status, incidents, history] = await Promise.all([
    readStatus(),
    readIncidents(),
    readAllHistory(sites.map((s) => s.id)),
  ]);

  const now = Date.now();
  const views: SiteView[] = sites.map((site) => {
    const checks = history[site.id]?.checks ?? [];
    return {
      site,
      status: status.sites.find((s) => s.id === site.id) ?? null,
      checks,
      uptime: UPTIME_WINDOWS.map((w) => ({
        label: w.label,
        value: computeUptime(checks, w.ms, now),
      })),
    };
  });

  return (
    <Dashboard
      sites={views}
      generatedAt={status.generatedAt}
      incidents={incidents.incidents}
    />
  );
}
