import type { Site } from "../lib/types";

/**
 * The apps Sentinel monitors.
 *
 * To track another app, just append an entry here — the monitor script and the
 * dashboard both read from this single source of truth.
 */
export const sites: Site[] = [
  {
    id: "portfolio",
    name: "Portfolio",
    url: "https://vinersardan.com",
    description: "Personal developer portfolio",
  },
  {
    id: "loan-tracker",
    name: "Loan Tracker",
    url: "https://vinersar31.github.io/loan_tracker/",
    description: "Loan tracking web app",
  },
  {
    id: "personal-ops",
    name: "Personal Ops",
    url: "https://vinersar31.github.io/personal-ops/",
    description: "Personal operations dashboard",
  },
];

/** A site counts as "up" when its HTTP status code is below this value. */
export const UP_STATUS_THRESHOLD = 400;

/** How many days of individual checks to keep in each history file. */
export const HISTORY_RETENTION_DAYS = 30;

/** Per-request timeout for a health check, in milliseconds. */
export const CHECK_TIMEOUT_MS = 15_000;
