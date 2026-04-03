"use client";

import { getCryptoIconUrl, getFiatFlag } from "@/lib/crypto-icons";

interface AmountFieldProps {
  label: string;
  amount: string;
  onAmountChange?: (val: string) => void;
  readOnly?: boolean;
  fiatEquivalent?: string;
  tokenCode: string;
  tokenName?: string;
  tokenIcon?: string;
  isFiat?: boolean;
  fiatCurrency?: string;
  onTokenClick?: () => void;
  rightLabel?: string;
  error?: string | null;
  shimmer?: boolean;
}

export function AmountField({
  label,
  amount,
  onAmountChange,
  readOnly = false,
  fiatEquivalent,
  tokenCode,
  tokenIcon,
  isFiat = false,
  fiatCurrency,
  onTokenClick,
  rightLabel,
  error,
  shimmer = false,
}: AmountFieldProps) {
  const icon = isFiat ? null : tokenIcon || getCryptoIconUrl(tokenCode);
  const displayCode = tokenCode.split("_")[0];

  return (
    <div className={`rounded-2xl p-4 transition-all duration-200 ${
      error
        ? "bg-red-500/5 dark:bg-red-500/5 ring-1 ring-red-500/20"
        : "bg-accent/50 dark:bg-white/[0.03] hover:bg-accent/70 dark:hover:bg-white/[0.05]"
    }`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        {rightLabel && (
          <span className="text-xs text-muted-foreground">{rightLabel}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {readOnly ? (
          <div className={`flex-1 text-3xl font-semibold tabular-nums tracking-tight ${
            shimmer ? "animate-pulse text-muted-foreground" : ""
          } ${!amount || amount === "0" ? "text-muted-foreground/50" : ""}`}>
            {amount || "0"}
          </div>
        ) : (
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9.]/g, "");
              if (v.split(".").length > 2) return;
              onAmountChange?.(v);
            }}
            placeholder="0"
            className="flex-1 text-3xl font-semibold tabular-nums tracking-tight bg-transparent outline-none placeholder:text-muted-foreground/30 min-w-0"
          />
        )}

        <button
          onClick={onTokenClick}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary hover:bg-secondary/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-border/50 dark:border-white/[0.08] hover:border-border dark:hover:border-white/[0.15] transition-all shrink-0 hover:shadow-md"
        >
          {isFiat ? (
            <span className="text-lg leading-none">{getFiatFlag(tokenCode)}</span>
          ) : (
            icon && <img src={icon} alt="" className="w-5 h-5 rounded-full" />
          )}
          <span className="font-semibold text-sm">{displayCode}</span>
          {!isFiat && (
            <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground">
          {fiatEquivalent || (fiatCurrency ? `~ ${fiatCurrency}` : "")}
        </span>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}
