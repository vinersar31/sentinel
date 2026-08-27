
import { RelativeTime } from "@/components/relative-time";
import type { Incident } from "@/lib/types";

export function IncidentList({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <div className="flex items-center gap-3 py-4 text-muted-foreground font-mono text-sm border-b border-border">
        <span>No incidents recorded. All systems have been nominal.</span>
      </div>
    );
  }

  const sorted = [...incidents].sort(
    (a, b) => Date.parse(b.start) - Date.parse(a.start),
  );

  return (
    <ul className="flex flex-col m-0 p-0 list-none font-mono text-sm">
      {sorted.map((inc) => {
        const ongoing = inc.end === null;
        return (
          <li
            key={inc.id}
            className="flex items-start md:items-center justify-between gap-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground whitespace-nowrap">
                {inc.siteName}:
              </span>
              <span className="text-muted-foreground">
                {ongoing ? (
                  <>
                    <span className="text-destructive">Down</span> since <RelativeTime iso={inc.start} /> (ongoing)
                  </>
                ) : (
                  <>
                    Down for <RelativeTime iso={inc.end!} /> (started <RelativeTime iso={inc.start} />)
                  </>
                )}
                {inc.lastCode !== null
                    ? ` · HTTP ${inc.lastCode}`
                    : " · no response"}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
