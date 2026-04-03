"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getFiatFlag, getPaymentMethodInfo } from "@/lib/crypto-icons";
import type { MeldCountry, FiatCurrency, PaymentMethod } from "@/lib/types";

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
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"main" | "country" | "currency" | "payment">("main");
  const [search, setSearch] = useState("");

  const currentCountry = countries.find((c) => c.countryCode === countryCode);
  const currentPM = selectedPayment ? getPaymentMethodInfo(selectedPayment) : null;

  function close() {
    setOpen(false);
    setTimeout(() => { setTab("main"); setSearch(""); }, 200);
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 45 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Settings"
      >
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </motion.button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) close(); else setOpen(true); }}>
        <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden bg-card border-border/30 rounded-2xl">
          <AnimatePresence mode="wait">
            {tab === "main" && (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="p-5 space-y-2"
              >
                <DialogTitle className="text-base font-bold mb-4">Settings</DialogTitle>

                <SettingsRow
                  icon={currentCountry?.flagImageUrl ? (
                    <img src={currentCountry.flagImageUrl} alt="" className="w-6 h-4 rounded object-cover" />
                  ) : <span className="text-lg">🌍</span>}
                  label="Country"
                  value={currentCountry?.name || countryCode}
                  onClick={() => { setTab("country"); setSearch(""); }}
                />

                <SettingsRow
                  icon={<span className="text-lg">{getFiatFlag(fiatCurrency)}</span>}
                  label="Currency"
                  value={fiatCurrency}
                  onClick={() => { setTab("currency"); setSearch(""); }}
                />

                <SettingsRow
                  icon={<span className="text-lg">{currentPM?.icon || "💳"}</span>}
                  label="Payment Method"
                  value={currentPM?.label || "All methods"}
                  sublabel={currentPM?.description}
                  onClick={() => { setTab("payment"); setSearch(""); }}
                />
              </motion.div>
            )}

            {tab === "country" && (
              <motion.div
                key="country"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <ListHeader title="Select Country" onBack={() => setTab("main")} search={search} onSearch={setSearch} placeholder="Search countries..." />
                <ScrollArea className="h-[340px]">
                  <div className="px-2 pb-2">
                    {countries
                      .filter((c) => !search || (c.name || "").toLowerCase().includes(search.toLowerCase()) || c.countryCode.toLowerCase().includes(search.toLowerCase()))
                      .map((c) => (
                        <button
                          key={c.countryCode}
                          onClick={() => { onCountryChange(c.countryCode); setTab("main"); setSearch(""); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                            c.countryCode === countryCode ? "bg-violet-500/10" : "hover:bg-accent"
                          }`}
                        >
                          {c.flagImageUrl ? (
                            <img src={c.flagImageUrl} alt="" className="w-7 h-5 rounded object-cover shrink-0" />
                          ) : (
                            <span className="w-7 text-center text-lg shrink-0">🌍</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{c.name || c.countryName}</div>
                            <div className="text-[11px] text-muted-foreground">{c.countryCode}</div>
                          </div>
                          {c.countryCode === countryCode && <Check />}
                        </button>
                      ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}

            {tab === "currency" && (
              <motion.div
                key="currency"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <ListHeader title="Select Currency" onBack={() => setTab("main")} search={search} onSearch={setSearch} placeholder="Search currencies..." />
                <ScrollArea className="h-[340px]">
                  <div className="px-2 pb-2">
                    {fiatCurrencies
                      .filter((c) => !search || c.currencyCode.toLowerCase().includes(search.toLowerCase()) || (c.name || "").toLowerCase().includes(search.toLowerCase()))
                      .map((c) => (
                        <button
                          key={c.currencyCode}
                          onClick={() => { onFiatChange(c.currencyCode); setTab("main"); setSearch(""); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                            c.currencyCode === fiatCurrency ? "bg-violet-500/10" : "hover:bg-accent"
                          }`}
                        >
                          <span className="text-lg w-7 text-center shrink-0">{getFiatFlag(c.currencyCode)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{c.currencyCode}</div>
                            {c.name && <div className="text-[11px] text-muted-foreground truncate">{c.name}</div>}
                          </div>
                          {c.currencyCode === fiatCurrency && <Check />}
                        </button>
                      ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}

            {tab === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <ListHeader title="Payment Method" onBack={() => setTab("main")} />
                <ScrollArea className="h-[340px]">
                  <div className="px-2 pb-2">
                    <button
                      onClick={() => { onPaymentChange(""); setTab("main"); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${
                        !selectedPayment ? "bg-violet-500/10" : "hover:bg-accent"
                      }`}
                    >
                      <span className="text-lg w-7 text-center shrink-0">✨</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">All Methods</div>
                        <div className="text-[11px] text-muted-foreground">Compare across all payment types</div>
                      </div>
                      {!selectedPayment && <Check />}
                    </button>

                    {paymentMethods.map((pm) => {
                      const info = getPaymentMethodInfo(pm.paymentMethod);
                      const active = selectedPayment === pm.paymentMethod;
                      return (
                        <button
                          key={pm.paymentMethod}
                          onClick={() => { onPaymentChange(pm.paymentMethod); setTab("main"); }}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${
                            active ? "bg-violet-500/10" : "hover:bg-accent"
                          }`}
                        >
                          <span className="text-lg w-7 text-center shrink-0">{info.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{info.label}</div>
                            <div className="text-[11px] text-muted-foreground">{info.description}</div>
                          </div>
                          {active && <Check />}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  sublabel,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent transition-colors text-left group"
    >
      <div className="w-9 h-9 rounded-xl bg-accent dark:bg-white/[0.05] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
        <div className="text-sm font-semibold truncate">{value}</div>
        {sublabel && <div className="text-[10px] text-muted-foreground">{sublabel}</div>}
      </div>
      <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

function ListHeader({
  title,
  onBack,
  search,
  onSearch,
  placeholder,
}: {
  title: string;
  onBack: () => void;
  search?: string;
  onSearch?: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="p-4 pb-2 space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 -ml-1 rounded-lg hover:bg-accent transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <DialogTitle className="text-base font-bold">{title}</DialogTitle>
      </div>
      {onSearch && (
        <input
          value={search || ""}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className="w-full h-10 px-3 rounded-xl bg-accent dark:bg-white/[0.05] border border-border/50 text-sm outline-none focus:ring-1 focus:ring-violet-500/50 placeholder:text-muted-foreground/50"
        />
      )}
    </div>
  );
}

function Check() {
  return (
    <svg className="w-4 h-4 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
