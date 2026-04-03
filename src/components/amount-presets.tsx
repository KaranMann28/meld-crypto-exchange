"use client";

import { cn } from "@/lib/utils";

const PRESETS = [50, 100, 500] as const;

interface AmountPresetsProps {
  fiatCurrency: string;
  limits: Record<string, { minAmount: number; maxAmount: number }> | null;
  disabled?: boolean;
  onSelect: (amount: number) => void;
}

export function AmountPresets({
  fiatCurrency,
  limits,
  disabled,
  onSelect,
}: AmountPresetsProps) {
  const lim = limits?.[fiatCurrency];
  const sym =
    fiatCurrency === "USD"
      ? "$"
      : fiatCurrency === "EUR"
        ? "€"
        : fiatCurrency === "GBP"
          ? "£"
          : "";

  function inRange(n: number): boolean {
    if (!lim) return true;
    return n >= lim.minAmount && n <= lim.maxAmount;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-full text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Quick amounts
      </span>
      {PRESETS.map((n) => {
        const ok = inRange(n);
        return (
          <button
            key={n}
            type="button"
            disabled={disabled || !ok}
            onClick={() => onSelect(n)}
            title={!ok && lim ? `Allowed ${lim.minAmount}–${lim.maxAmount} ${fiatCurrency}` : undefined}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors",
              ok && !disabled
                ? "border-border/60 bg-background/40 text-foreground hover:border-violet-500/40 hover:bg-violet-500/10"
                : "cursor-not-allowed border-border/20 text-muted-foreground/40",
            )}
          >
            {sym}
            {n}
          </button>
        );
      })}
      {lim && inRange(lim.maxAmount) && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect(lim.maxAmount)}
          className="rounded-lg border border-border/60 bg-background/40 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-violet-500/40 hover:bg-violet-500/10 disabled:opacity-40"
        >
          Max
        </button>
      )}
    </div>
  );
}
