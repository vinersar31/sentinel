"use client";

import { useState } from "react";
import { Activity, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMs } from "@/lib/format";

type LiveResult = { reachable: boolean; ms: number | null };

/**
 * Performs a live, client-side reachability ping. Because cross-origin rules
 * make the response opaque, this can only confirm the network round-trip
 * succeeded (and its timing) — the authoritative status comes from the hourly
 * server-side checks.
 */
export function CheckNowButton({ url }: { url: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LiveResult | null>(null);

  async function check() {
    setLoading(true);
    setResult(null);
    const started = performance.now();
    try {
      await fetch(url, {
        mode: "no-cors",
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      setResult({
        reachable: true,
        ms: Math.round(performance.now() - started),
      });
    } catch {
      setResult({ reachable: false, ms: null });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={check}
        disabled={loading}
        title="Live network ping from your browser. Cross-origin rules hide the exact status code, so this only confirms reachability."
      >
        {loading ? (
          <LoaderCircle className="size-3.5 animate-spin" />
        ) : (
          <Activity className="size-3.5" />
        )}
        Check now
      </Button>
      {result && (
        <span
          className={
            result.reachable
              ? "text-xs text-emerald-600 dark:text-emerald-400"
              : "text-xs text-red-600 dark:text-red-400"
          }
        >
          {result.reachable
            ? `Reachable · ${formatMs(result.ms)}`
            : "No response"}
        </span>
      )}
    </div>
  );
}
