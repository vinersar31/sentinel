import { formatDistanceToNowStrict } from "date-fns";

/** "842 ms" / "1.23 s" / "—" */
export function formatMs(ms: number | null): string {
  if (ms === null || Number.isNaN(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/** "99.95%" / "—" */
export function formatPercent(value: number | null, digits = 2): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

/** "5 minutes ago" / "never". Call on the client to avoid hydration drift. */
export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "never";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "unknown";
  return `${formatDistanceToNowStrict(t)} ago`;
}

/** Host portion of a URL, e.g. "vinersardan.com". */
export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
