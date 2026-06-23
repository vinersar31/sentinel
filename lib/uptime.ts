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
