"use client";

import { useEffect, useState } from "react";

import { formatRelativeTime } from "@/lib/format";

/**
 * Renders a relative timestamp ("5 minutes ago") on the client only.
 *
 * Time-based text is computed after mount so the server-rendered HTML (baked at
 * build time) matches the first client render, avoiding hydration mismatches.
 */
export function RelativeTime({
  iso,
  className,
}: {
  iso: string | null;
  className?: string;
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    const update = () => setText(formatRelativeTime(iso));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [iso]);

  return (
    <span className={className} suppressHydrationWarning>
      {text || "—"}
    </span>
  );
}
