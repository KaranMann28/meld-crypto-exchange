"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CryptoQuote } from "@/lib/types";

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_DEBIT_CARD: "Card",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
  SEPA: "SEPA",
  PIX: "PIX",
  ACH: "ACH",
  BANK_TRANSFER: "Bank Transfer",
};

function fmtPM(key: string): string {
  return PAYMENT_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface QuoteDetailsProps {
  quote: CryptoQuote;
}

export function QuoteDetails({ quote }: QuoteDetailsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>
          1 {quote.destinationCurrencyCode.split("_")[0]} = {quote.exchangeRate?.toLocaleString(undefined, { maximumFractionDigits: 2 })} {quote.sourceCurrencyCode}
        </span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1.5 text-xs border-t border-white/[0.06] pt-2.5">
              <Row label="Provider" value={quote.serviceProvider} />
              <Row label="Payment" value={fmtPM(quote.paymentMethodType)} />
              <Row label="Total fee" value={fmt(quote.totalFee)} />
              <Row label="Network fee" value={fmt(quote.networkFee)} />
              <Row label="Provider fee" value={fmt(quote.transactionFee)} />
              <Row label="Partner fee" value={fmt(quote.partnerFee)} />
              <Row
                label="rampScore"
                value={quote.rampIntelligence?.rampScore?.toFixed(1) ?? "N/A"}
                detail={quote.rampIntelligence?.lowKyc ? "Low KYC" : undefined}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        {value}
        {detail && <span className="text-green-400 ml-1.5">{detail}</span>}
      </span>
    </div>
  );
}

function fmt(val: number | null | undefined): string {
  return val != null ? `$${val.toFixed(2)}` : "—";
}
