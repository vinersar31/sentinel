/**
 * Shared data shapes used by both the monitor script (Node) and the dashboard
 * (Next.js). Everything here is plain, JSON-serializable data so it can be
 * written to `public/data/*.json` and passed from Server to Client Components.
 */

/** A monitored application. Configured in `config/sites.ts`. */
export interface Site {
  /** Stable identifier, also used as the history file name. */
  id: string;
  /** Human-friendly name shown on the card. */
  name: string;
  /** Fully-qualified URL that gets health-checked. */
  url: string;
  /** Optional one-line description. */
  description?: string;
}

/** A single health-check sample stored in a site's history file. */
export interface Check {
  /** ISO timestamp of the check. */
  t: string;
  /** Whether the site was considered up. */
  up: boolean;
  /** HTTP status code, or null when the request failed/timed out. */
  code: number | null;
  /** Response time in milliseconds, or null when the request failed. */
  ms: number | null;
}

/** The latest snapshot for one site (written to `status.json`). */
export interface SiteStatus {
  id: string;
  name: string;
  url: string;
  description?: string;
  up: boolean;
  statusCode: number | null;
  responseTimeMs: number | null;
  checkedAt: string;
}

/** `public/data/status.json` */
export interface StatusFile {
  generatedAt: string;
  sites: SiteStatus[];
}

/** `public/data/history/<id>.json` */
export interface HistoryFile {
  id: string;
  checks: Check[];
}

/** A period during which a site was down. */
export interface Incident {
  /** Unique id (`<siteId>-<startIso>`). */
  id: string;
  siteId: string;
  siteName: string;
  /** ISO timestamp when the outage was first observed. */
  start: string;
  /** ISO timestamp when the site recovered, or null while ongoing. */
  end: string | null;
  /** Last HTTP status code seen during the outage (null on network error). */
  lastCode: number | null;
}

/** `public/data/incidents.json` */
export interface IncidentsFile {
  incidents: Incident[];
}
