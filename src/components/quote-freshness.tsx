"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const AUTO_REFRESH_MS = 30_000;
const STALE_WARN_MS = 45_000;

function formatAge(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return `${m}m ago`;
}

interface QuoteFreshnessProps {
  updatedAt: number;
  loading: boolean;
  hasQuotes: boolean;
  onRefresh: () => void;
}

export function QuoteFreshness({
  updatedAt,
  loading,
  hasQuotes,
  onRefresh,
}: QuoteFreshnessProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const age = now - updatedAt;
  const untilAutoSec =
    hasQuotes && !loading
      ? Math.max(0, Math.ceil((AUTO_REFRESH_MS - age) / 1000))
      : null;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/40 bg-card/40 px-3 py-2"
      aria-live="polite"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
        {loading ? (
          <span>Refreshing quotes…</span>
        ) : (
          <>
            <span>Updated {formatAge(age)}</span>
            {untilAutoSec !== null && (
              <span className="text-muted-foreground/80">
                · Auto-refresh in {untilAutoSec}s
              </span>
            )}
            {hasQuotes && age >= STALE_WARN_MS && (
              <span className="text-amber-600 dark:text-amber-400/90">
                · Rates may have shifted
              </span>
            )}
          </>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 shrink-0 px-2 text-[11px] text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300"
        disabled={loading}
        onClick={onRefresh}
      >
        <RefreshCw
          className={`mr-1 size-3.5 ${loading ? "animate-spin" : ""}`}
          aria-hidden
        />
        Refresh
      </Button>
    </div>
  );
}
