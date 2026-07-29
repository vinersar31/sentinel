import { getDb } from "./firebase";
import type { HistoryFile, IncidentsFile, StatusFile } from "./types";

/**
 * Build-time readers for the monitoring data in Firestore.
 *
 * These run on the server during `next build` (static export). Each reader is defensive:
 * if a document is missing or malformed it returns an empty fallback so the dashboard still renders.
 */

export async function readStatus(): Promise<StatusFile> {
  try {
    const db = getDb();
    const doc = await db.collection("sentinel").doc("status").get();
    if (doc.exists) {
      return doc.data() as StatusFile;
    }
  } catch (error) {
    console.error("Error reading status from Firestore:", error);
  }
  return { generatedAt: "", sites: [] };
}

export async function readIncidents(): Promise<IncidentsFile> {
  try {
    const db = getDb();
    const doc = await db.collection("sentinel").doc("incidents").get();
    if (doc.exists) {
      return doc.data() as IncidentsFile;
    }
  } catch (error) {
    console.error("Error reading incidents from Firestore:", error);
  }
  return { incidents: [] };
}

export async function readHistory(id: string): Promise<HistoryFile> {
  try {
    const db = getDb();
    const doc = await db.collection("sentinel_history").doc(id).get();
    if (doc.exists) {
      return doc.data() as HistoryFile;
    }
  } catch (error) {
    console.error(`Error reading history for ${id} from Firestore:`, error);
  }
  return { id, checks: [] };
}

export async function readAllHistory(
  ids: string[],
): Promise<Record<string, HistoryFile>> {
  const entries = await Promise.all(
    ids.map(async (id) => [id, await readHistory(id)] as const),
  );
  return Object.fromEntries(entries);
}
