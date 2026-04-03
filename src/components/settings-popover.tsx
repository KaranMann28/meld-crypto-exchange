"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFiatFlag } from "@/lib/crypto-icons";
import type { MeldCountry, FiatCurrency, PaymentMethod } from "@/lib/types";

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_DEBIT_CARD: "Card",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
  SEPA: "SEPA",
  PIX: "PIX",
  ACH: "ACH",
  BANK_TRANSFER: "Bank",
  OPEN_BANKING: "Open Banking",
  UK_FASTER_PAYMENTS: "UK Faster",
  UPI: "UPI",
  SPEI: "SPEI",
  PAYOUT_TO_CARD: "Card Payout",
};

function fmtPM(key: string): string {
  return PAYMENT_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface SettingsPopoverProps {
  countries: MeldCountry[];
  countryCode: string;
  onCountryChange: (code: string) => void;
  fiatCurrencies: FiatCurrency[];
  fiatCurrency: string;
  onFiatChange: (code: string) => void;
  paymentMethods: PaymentMethod[];
  selectedPayment: string;
  onPaymentChange: (key: string) => void;
}

export function SettingsPopover({
  countries,
  countryCode,
  onCountryChange,
  fiatCurrencies,
  fiatCurrency,
  onFiatChange,
  paymentMethods,
  selectedPayment,
  onPaymentChange,
}: SettingsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        aria-label="Settings"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-[#111118] border-border/30 p-4 space-y-4" align="end">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Settings
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Country</label>
          <Select value={countryCode} onValueChange={(v) => v && onCountryChange(v)}>
            <SelectTrigger className="h-9 bg-white/5 border-white/10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.countryCode} value={c.countryCode}>
                  <span className="flex items-center gap-2">
                    {c.flagImageUrl && (
                      <img src={c.flagImageUrl} alt="" className="w-4 h-3 rounded-sm object-cover" />
                    )}
                    {c.name || c.countryName}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Fiat currency</label>
          <Select value={fiatCurrency} onValueChange={(v) => v && onFiatChange(v)}>
            <SelectTrigger className="h-9 bg-white/5 border-white/10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fiatCurrencies.map((c) => (
                <SelectItem key={c.currencyCode} value={c.currencyCode}>
                  {getFiatFlag(c.currencyCode)} {c.currencyCode}
                  {c.name && <span className="text-muted-foreground ml-1 text-xs">({c.name})</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {paymentMethods.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Payment method</label>
            <div className="flex flex-wrap gap-1.5">
              {paymentMethods.map((pm) => {
                const key = pm.paymentMethod;
                const active = selectedPayment === key;
                return (
                  <button
                    key={key}
                    onClick={() => onPaymentChange(active ? "" : key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                      active
                        ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                        : "bg-white/5 text-muted-foreground border-transparent hover:border-white/10"
                    }`}
                  >
                    {fmtPM(key)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
