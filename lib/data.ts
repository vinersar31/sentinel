import { promises as fs } from "node:fs";
import path from "node:path";

import type { HistoryFile, IncidentsFile, StatusFile } from "./types";

/**
 * Build-time readers for the monitoring data in `public/data`.
 *
 * These run on the server during `next build` (static export), so they use the
 * filesystem directly. Each reader is defensive: if a file is missing or
 * malformed it returns an empty fallback so the dashboard still renders.
 */

const DATA_DIR = path.join(process.cwd(), "public", "data");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function readStatus(): Promise<StatusFile> {
  return readJson<StatusFile>(path.join(DATA_DIR, "status.json"), {
    generatedAt: "",
    sites: [],
  });
}

export function readIncidents(): Promise<IncidentsFile> {
  return readJson<IncidentsFile>(path.join(DATA_DIR, "incidents.json"), {
    incidents: [],
  });
}

export function readHistory(id: string): Promise<HistoryFile> {
  return readJson<HistoryFile>(path.join(DATA_DIR, "history", `${id}.json`), {
    id,
    checks: [],
  });
}

export async function readAllHistory(
  ids: string[],
): Promise<Record<string, HistoryFile>> {
  const entries = await Promise.all(
    ids.map(async (id) => [id, await readHistory(id)] as const),
  );
  return Object.fromEntries(entries);
}
