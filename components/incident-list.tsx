import { CircleCheck } from "lucide-react";

import { RelativeTime } from "@/components/relative-time";
import { Badge } from "@/components/ui/badge";
import type { Incident } from "@/lib/types";

export function IncidentList({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-card p-5 text-sm ring-1 ring-foreground/10">
        <CircleCheck className="size-5 text-emerald-500" />
        <span className="text-muted-foreground">
          No incidents recorded. All systems have been nominal.
        </span>
      </div>
    );
  }

  const sorted = [...incidents].sort(
    (a, b) => Date.parse(b.start) - Date.parse(a.start),
  );

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      {sorted.map((inc) => {
        const ongoing = inc.end === null;
        return (
          <li
            key={inc.id}
            className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
          >
            <div className="flex items-center gap-3">
              <span
                className={`size-2 rounded-full ${
                  ongoing ? "animate-pulse bg-red-500" : "bg-muted-foreground"
                }`}
              />
              <div>
                <div className="font-medium">{inc.siteName}</div>
                <div className="text-xs text-muted-foreground">
                  Started <RelativeTime iso={inc.start} />
                  {inc.lastCode !== null
                    ? ` · HTTP ${inc.lastCode}`
                    : " · no response"}
                </div>
              </div>
            </div>
            {ongoing ? (
              <Badge variant="destructive">Ongoing</Badge>
            ) : (
              <Badge variant="secondary">
                Resolved&nbsp;<RelativeTime iso={inc.end} />
              </Badge>
            )}
          </li>
        );
      })}
    </ul>
  );
}
