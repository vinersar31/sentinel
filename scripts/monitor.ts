/**
 * Sentinel monitor.
 *
 * Probes every configured site, then updates the Firestore data the dashboard reads:
 *   - sentinel_history/<id>          rolling per-site check history (pruned)
 *   - sentinel/status                latest snapshot for every site
 *   - sentinel/incidents             open/closed outage windows
 *
 * Runs on Node 22 (built-in fetch) via `npm run monitor`, locally and in CI.
 */
import { getDb } from "../lib/firebase";
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

async function appendHistory(
  site: Site,
  check: Check,
  now: number,
): Promise<void> {
  const db = getDb();
  const docRef = db.collection("sentinel_history").doc(site.id);

  let history: HistoryFile = { id: site.id, checks: [] };
  const doc = await docRef.get();
  if (doc.exists) {
    history = doc.data() as HistoryFile;
  }

  const cutoff = now - RETENTION_MS;
  const checks = history.checks.filter((c) => Date.parse(c.t) >= cutoff);
  checks.push(check);

  await docRef.set({ id: site.id, checks } satisfies HistoryFile);
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

  const db = getDb();
  const incidentsDoc = await db.collection("sentinel").doc("incidents").get();
  const existingIncidents = incidentsDoc.exists
    ? (incidentsDoc.data() as IncidentsFile).incidents
    : [];

  let incidents = existingIncidents;
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

  await db.collection("sentinel").doc("status").set({
    generatedAt: nowIso,
    sites: statuses,
  } satisfies StatusFile);

  await db.collection("sentinel").doc("incidents").set({
    incidents,
  } satisfies IncidentsFile);

  const upCount = statuses.filter((s) => s.up).length;
  console.log(`\n${upCount}/${statuses.length} sites up · ${nowIso}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
