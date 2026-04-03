"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCryptoIconUrl } from "@/lib/crypto-icons";
import type { CryptoCurrency } from "@/lib/types";

const SANDBOX_TOKENS = ["BTC", "ETH", "USDC"];

interface TokenSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokens: CryptoCurrency[];
  selected: string;
  onSelect: (code: string) => void;
}

export function TokenSelector({
  open,
  onOpenChange,
  tokens,
  selected,
  onSelect,
}: TokenSelectorProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return tokens;
    return tokens.filter(
      (t) =>
        t.currencyCode.toLowerCase().includes(q) ||
        (t.name || "").toLowerCase().includes(q) ||
        (t.chainName || "").toLowerCase().includes(q),
    );
  }, [tokens, search]);

  const sandbox = filtered.filter((t) => SANDBOX_TOKENS.includes(t.currencyCode));
  const rest = filtered.filter((t) => !SANDBOX_TOKENS.includes(t.currencyCode));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden bg-[#111118] border-border/30">
        <div className="p-4 pb-2 space-y-3">
          <DialogTitle className="text-base font-semibold">Select token</DialogTitle>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or symbol..."
            className="h-10 bg-white/5 border-white/10 text-sm"
            autoFocus
          />

          {!search && (
            <div className="flex gap-2">
              {SANDBOX_TOKENS.map((code) => {
                const token = tokens.find((t) => t.currencyCode === code);
                if (!token) return null;
                const isSelected = selected === code;
                return (
                  <button
                    key={code}
                    onClick={() => { onSelect(code); onOpenChange(false); setSearch(""); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    <img
                      src={token.symbolImageUrl || getCryptoIconUrl(code)}
                      alt=""
                      className="w-4 h-4 rounded-full"
                    />
                    {code}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <ScrollArea className="h-[320px]">
          <div className="px-2 pb-2">
            {sandbox.length > 0 && !search && (
              <div className="px-2 pt-1 pb-1">
                <span className="text-[10px] font-medium text-green-400/80 uppercase tracking-wider">
                  Sandbox Supported
                </span>
              </div>
            )}

            {(search ? filtered : [...sandbox, ...rest]).map((token) => {
              const isSandbox = SANDBOX_TOKENS.includes(token.currencyCode);
              const isSelected = selected === token.currencyCode;
              return (
                <button
                  key={token.currencyCode}
                  onClick={() => { onSelect(token.currencyCode); onOpenChange(false); setSearch(""); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    isSelected
                      ? "bg-violet-500/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  <img
                    src={token.symbolImageUrl || getCryptoIconUrl(token.currencyCode)}
                    alt=""
                    className="w-8 h-8 rounded-full bg-white/5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm">
                        {token.currencyCode}
                      </span>
                      {isSandbox && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/20">
                          Sandbox
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {token.name} · {token.chainName}
                    </div>
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No tokens match &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
