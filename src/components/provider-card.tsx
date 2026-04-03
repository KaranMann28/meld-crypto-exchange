"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProviderColor } from "@/lib/crypto-icons";
import type { CryptoQuote } from "@/lib/types";

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_DEBIT_CARD: "Card",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
};

function fmtPM(key: string): string {
  return PAYMENT_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ProviderCardProps {
  quote: CryptoQuote;
  index: number;
  isTop: boolean;
  worstAmount: number | null;
  onSelect: () => void;
  loading: boolean;
}

export function ProviderCard({
  quote,
  index,
  isTop,
  worstAmount,
  onSelect,
  loading,
}: ProviderCardProps) {
  const color = getProviderColor(quote.serviceProvider);

  const pctBetter =
    isTop && worstAmount && worstAmount > 0
      ? (((quote.destinationAmount - worstAmount) / worstAmount) * 100).toFixed(1)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        className={`rounded-2xl border p-4 transition-all hover:translate-y-[-1px] hover:shadow-lg ${
          isTop
            ? "border-violet-500/30 bg-violet-500/[0.04] shadow-md shadow-violet-500/5"
            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: color }}
            >
              {quote.serviceProvider.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-1.5">
                {quote.serviceProvider}
                {isTop && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-violet-500/15 text-violet-400 border-violet-500/20"
                  >
                    Best
                  </Badge>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground">
                <span title="Conversion likelihood score">
                  Score {quote.rampIntelligence?.rampScore?.toFixed(1) ?? "N/A"}
                </span>
                {quote.rampIntelligence?.lowKyc && " · Low KYC"}
                {quote.paymentMethodType && ` · ${fmtPM(quote.paymentMethodType)}`}
                {pctBetter && parseFloat(pctBetter) > 0 && (
                  <span className="text-green-400 ml-1">· +{pctBetter}%</span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="font-bold text-sm tabular-nums">
              {quote.destinationAmount?.toFixed(8)}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Fee: ${quote.totalFee?.toFixed(2) ?? "—"}
            </div>
          </div>
        </div>

        <Button
          onClick={onSelect}
          disabled={loading}
          variant="outline"
          className={`w-full h-9 text-sm rounded-xl transition-all ${
            isTop
              ? "bg-violet-500/10 border-violet-500/30 text-violet-300 hover:bg-violet-500/20"
              : "hover:bg-white/5 border-white/[0.08]"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              Opening...
            </span>
          ) : (
            `Buy with ${quote.serviceProvider}`
          )}
        </Button>
      </div>
    </motion.div>
  );
}
