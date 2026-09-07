"use client";

import { useMemo } from "react";
import { Check, HelpCircle, X } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { computeDailyBuckets, computeUptime, type DayBucket } from "@/lib/uptime";
import { cn } from "@/lib/utils";
import type { Check as CheckType } from "@/lib/types";

interface UptimeBarProps {
  checks: CheckType[];
  up?: boolean | null;
  daysCount?: number;
  className?: string;
}

function StatusIndicator({ up }: { up: boolean | null | undefined }) {
  if (up === false) {
    return (
      <div
        title="Current status: Down"
        className="flex size-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-xs"
      >
        <X className="size-3.5 stroke-[3]" />
      </div>
    );
  }
  if (up === true) {
    return (
      <div
        title="Current status: Operational"
        className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs"
      >
        <Check className="size-3.5 stroke-[3]" />
      </div>
    );
  }
  return (
    <div
      title="Current status: Unknown"
      className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-xs"
    >
      <HelpCircle className="size-3.5 stroke-[2]" />
    </div>
  );
}

function getBarColor(status: DayBucket["status"]): string {
  switch (status) {
    case "operational":
      return "bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400";
    case "degraded":
      return "bg-amber-500 hover:bg-amber-400 dark:bg-amber-500 dark:hover:bg-amber-400";
    case "outage":
      return "bg-rose-500 hover:bg-rose-400 dark:bg-rose-500 dark:hover:bg-rose-400";
    case "no-data":
    default:
      return "bg-muted/70 hover:bg-muted dark:bg-muted/50 dark:hover:bg-muted";
  }
}

export function UptimeBar({
  checks,
  up,
  daysCount = 30,
  className,
}: UptimeBarProps) {
  const buckets = useMemo(
    () => computeDailyBuckets(checks, daysCount),
    [checks, daysCount],
  );

  const overallUptime = useMemo(() => {
    return computeUptime(checks, daysCount * 24 * 60 * 60 * 1000);
  }, [checks, daysCount]);

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {/* Top row: Status indicator on the right, matching reference */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Uptime History
        </span>
        <StatusIndicator up={up} />
      </div>

      {/* Segmented daily status bars */}
      <TooltipProvider delay={60} closeDelay={150}>
        <div className="flex h-8 sm:h-9 w-full items-center gap-[2px] sm:gap-[3px]">
          {buckets.map((bucket) => {
            const colorClass = getBarColor(bucket.status);
            return (
              <Tooltip key={bucket.date}>
                <TooltipTrigger
                  aria-label={`${bucket.formattedDate}: ${bucket.status}`}
                  className={cn(
                    "flex-1 h-full rounded-[2px] transition-transform duration-150 outline-none",
                    "hover:scale-y-110 cursor-pointer",
                    colorClass,
                  )}
                />
                <TooltipContent
                  side="top"
                  sideOffset={6}
                  className="flex flex-col gap-1 p-2 text-xs"
                >
                  <div className="font-semibold text-background">
                    {bucket.isToday ? `Today (${bucket.formattedDate})` : bucket.formattedDate}
                  </div>

                  {bucket.status === "operational" && (
                    <>
                      <div className="flex items-center gap-1.5 font-medium text-emerald-300">
                        <span className="size-1.5 rounded-full bg-emerald-300" />
                        Operational · 100%
                      </div>
                      <div className="text-[11px] opacity-80">
                        {bucket.totalChecks} checks · No downtime
                      </div>
                    </>
                  )}

                  {bucket.status === "degraded" && (
                    <>
                      <div className="flex items-center gap-1.5 font-medium text-amber-300">
                        <span className="size-1.5 rounded-full bg-amber-300" />
                        Partial outage · {bucket.uptimePercent?.toFixed(1)}%
                      </div>
                      <div className="text-[11px] opacity-80">
                        {bucket.upChecks} of {bucket.totalChecks} checks up · {bucket.downChecks} failed
                      </div>
                    </>
                  )}

                  {bucket.status === "outage" && (
                    <>
                      <div className="flex items-center gap-1.5 font-medium text-rose-300">
                        <span className="size-1.5 rounded-full bg-rose-300" />
                        Major outage · 0%
                      </div>
                      <div className="text-[11px] opacity-80">
                        {bucket.totalChecks} checks failed · Unreachable
                      </div>
                    </>
                  )}

                  {bucket.status === "no-data" && (
                    <div className="flex items-center gap-1.5 font-medium opacity-80">
                      <span className="size-1.5 rounded-full bg-muted-foreground" />
                      No data recorded
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Footer legend: [30 days ago] ────── 99.65 % uptime ────── Today */}
      <div className="flex items-center justify-between gap-3 pt-0.5 text-xs text-muted-foreground">
        <span className="text-[11px] font-medium tracking-tight text-muted-foreground/80 whitespace-nowrap">
          {daysCount} days ago
        </span>
        <div className="h-px flex-1 bg-border/70" />
        <span className="text-xs font-medium text-foreground/90 tabular-nums whitespace-nowrap">
          {overallUptime !== null ? `${overallUptime.toFixed(2)} % uptime` : "No data"}
        </span>
        <div className="h-px flex-1 bg-border/70" />
        <span className="text-[11px] font-medium tracking-tight text-muted-foreground/80 whitespace-nowrap">
          Today
        </span>
      </div>
    </div>
  );
}
