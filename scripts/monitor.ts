/**
 * Sentinel monitor.
 *
 * Probes every configured site, then updates the JSON data the dashboard reads:
 *   - public/data/history/<id>.json  rolling per-site check history (pruned)
 *   - public/data/status.json        latest snapshot for every site
 *   - public/data/incidents.json     open/closed outage windows
 *
 * Runs on Node 22 (built-in fetch) via `npm run monitor`, locally and in CI.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  CHECK_TIMEOUT_MS,
  HISTORY_RETENTION_DAYS,
  UP_STATUS_THRESHOLD,
  sites,
} from "../config/sites";
import type {
  Check,
  HistoryFile,
  Incident,
  IncidentsFile,
  Site,
  SiteStatus,
  StatusFile,
} from "../lib/types";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const HISTORY_DIR = path.join(DATA_DIR, "history");
const RETENTION_MS = HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;

interface ProbeResult {
  up: boolean;
  code: number | null;
  ms: number | null;
}

async function probe(site: Site): Promise<ProbeResult> {
  const started = performance.now();
  try {
    const res = await fetch(site.url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      headers: {
        "user-agent":
          "Sentinel-Monitor/1.0 (+https://github.com/vinersar31/sentinel)",
      },
    });
    const ms = Math.round(performance.now() - started);
    return { up: res.status < UP_STATUS_THRESHOLD, code: res.status, ms };
  } catch {
    return { up: false, code: null, ms: null };
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function appendHistory(
  site: Site,
  check: Check,
  now: number,
): Promise<void> {
  const file = path.join(HISTORY_DIR, `${site.id}.json`);
  const history = await readJson<HistoryFile>(file, {
    id: site.id,
    checks: [],
  });
  const cutoff = now - RETENTION_MS;
  const checks = history.checks.filter((c) => Date.parse(c.t) >= cutoff);
  checks.push(check);
  await writeJson(file, { id: site.id, checks } satisfies HistoryFile);
}

function updateIncidents(
  incidents: Incident[],
  site: Site,
  result: ProbeResult,
  nowIso: string,
  now: number,
): Incident[] {
  const open = incidents.find((i) => i.siteId === site.id && i.end === null);
  if (!result.up) {
    if (open) {
      open.lastCode = result.code;
    } else {
      incidents.push({
        id: `${site.id}-${nowIso}`,
        siteId: site.id,
        siteName: site.name,
        start: nowIso,
        end: null,
        lastCode: result.code,
      });
    }
  } else if (open) {
    open.end = nowIso;
  }
  // Drop resolved incidents that have aged out of the retention window.
  const cutoff = now - RETENTION_MS;
  return incidents.filter(
    (i) => i.end === null || Date.parse(i.end) >= cutoff,
  );
}

async function main(): Promise<void> {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  const { incidents: existing } = await readJson<IncidentsFile>(
    path.join(DATA_DIR, "incidents.json"),
    { incidents: [] },
  );
  let incidents = existing;
  const statuses: SiteStatus[] = [];

  for (const site of sites) {
    const result = await probe(site);
    const check: Check = {
      t: nowIso,
      up: result.up,
      code: result.code,
      ms: result.ms,
    };

    await appendHistory(site, check, now);
    incidents = updateIncidents(incidents, site, result, nowIso, now);

    statuses.push({
      id: site.id,
      name: site.name,
      url: site.url,
      description: site.description,
      up: result.up,
      statusCode: result.code,
      responseTimeMs: result.ms,
      checkedAt: nowIso,
    });

    console.log(
      `${result.up ? "UP  " : "DOWN"} ${site.name.padEnd(16)} ` +
        `${String(result.code ?? "ERR").padStart(3)} ` +
        `${result.ms === null ? "   -" : `${result.ms}ms`}`,
    );
  }

  await writeJson(path.join(DATA_DIR, "status.json"), {
    generatedAt: nowIso,
    sites: statuses,
  } satisfies StatusFile);
  await writeJson(path.join(DATA_DIR, "incidents.json"), {
    incidents,
  } satisfies IncidentsFile);

  const upCount = statuses.filter((s) => s.up).length;
  console.log(`\n${upCount}/${statuses.length} sites up · ${nowIso}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
