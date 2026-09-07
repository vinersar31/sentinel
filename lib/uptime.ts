import type { Check } from "./types";

export interface UptimeWindow {
  label: string;
  ms: number;
}

const DAY = 24 * 60 * 60 * 1000;

/** Trailing windows shown as uptime chips on each card. */
export const UPTIME_WINDOWS: UptimeWindow[] = [
  { label: "24h", ms: DAY },
  { label: "7d", ms: 7 * DAY },
  { label: "30d", ms: 30 * DAY },
];

/**
 * Percentage of successful checks within the trailing `windowMs`.
 * Returns `null` when there are no checks recorded in the window.
 */
export function computeUptime(
  checks: Check[],
  windowMs: number,
  now: number = Date.now(),
): number | null {
  const cutoff = now - windowMs;
  let total = 0;
  let up = 0;
  for (const c of checks) {
    const t = Date.parse(c.t);
    if (Number.isNaN(t) || t < cutoff) continue;
    total++;
    if (c.up) up++;
  }
  if (total === 0) return null;
  return (up / total) * 100;
}

export type DayStatus = "operational" | "degraded" | "outage" | "no-data";

export interface DayBucket {
  date: string;
  formattedDate: string;
  status: DayStatus;
  uptimePercent: number | null;
  totalChecks: number;
  upChecks: number;
  downChecks: number;
  isToday: boolean;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Computes consecutive daily status buckets for the last `daysCount` days,
 * ending at `now` (ordered from oldest to newest).
 */
export function computeDailyBuckets(
  checks: Check[],
  daysCount = 30,
  now: number = Date.now(),
): DayBucket[] {
  const buckets: DayBucket[] = [];
  const nowDate = new Date(now);

  const checksByDate = new Map<string, { total: number; up: number; down: number }>();
  for (const c of checks) {
    if (!c.t) continue;
    const dateStr = c.t.slice(0, 10);
    let entry = checksByDate.get(dateStr);
    if (!entry) {
      entry = { total: 0, up: 0, down: 0 };
      checksByDate.set(dateStr, entry);
    }
    entry.total++;
    if (c.up) {
      entry.up++;
    } else {
      entry.down++;
    }
  }

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(
        nowDate.getUTCFullYear(),
        nowDate.getUTCMonth(),
        nowDate.getUTCDate() - i,
      ),
    );
    const dateStr = d.toISOString().slice(0, 10);
    const isToday = i === 0;
    const formattedDate = `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

    const entry = checksByDate.get(dateStr);
    if (!entry || entry.total === 0) {
      buckets.push({
        date: dateStr,
        formattedDate,
        status: "no-data",
        uptimePercent: null,
        totalChecks: 0,
        upChecks: 0,
        downChecks: 0,
        isToday,
      });
    } else {
      const { total, up, down } = entry;
      const uptimePercent = (up / total) * 100;
      let status: DayStatus;
      if (down === 0) {
        status = "operational";
      } else if (up === 0) {
        status = "outage";
      } else {
        status = uptimePercent >= 50 ? "degraded" : "outage";
      }

      buckets.push({
        date: dateStr,
        formattedDate,
        status,
        uptimePercent,
        totalChecks: total,
        upChecks: up,
        downChecks: down,
        isToday,
      });
    }
  }

  return buckets;
}
