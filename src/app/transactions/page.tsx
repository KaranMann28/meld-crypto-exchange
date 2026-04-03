"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TransactionResult {
  transaction: {
    id: string;
    status: string;
    sourceAmount?: number;
    sourceCurrencyCode?: string;
    destinationAmount?: number;
    destinationCurrencyCode?: string;
    serviceProvider?: string;
    createdAt?: string;
    updatedAt?: string;
    cryptoDetails?: {
      destinationWalletAddress?: string;
      totalFee?: number;
      blockchainTransactionId?: string;
    };
  };
  webhookEvents?: Array<{
    eventType: string;
    timestamp: string;
    payload: { paymentTransactionStatus: string };
  }>;
}

interface RecentSession {
  id: string;
  provider: string;
  amount: number;
  fiat: string;
  crypto: string;
  ts: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  SETTLING: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  SETTLED: "bg-green-500/15 text-green-400 border-green-500/20",
  COMPLETED: "bg-green-500/15 text-green-400 border-green-500/20",
  FAILED: "bg-red-500/15 text-red-400 border-red-500/20",
  ERROR: "bg-red-500/15 text-red-400 border-red-500/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

export default function TransactionsPage() {
  const [txId, setTxId] = useState("");
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("meld_sessions") || "[]");
      setRecentSessions(Array.isArray(stored) ? stored : []);
    } catch { /* ignore */ }
  }, []);

  async function lookupTransaction(id?: string) {
    const lookupId = (id || txId).trim();
    if (!lookupId) return;
    setTxId(lookupId);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/transaction/${lookupId}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to fetch transaction");
    } finally {
      setLoading(false);
    }
  }

  const tx = result?.transaction;
  const statusClass = STATUS_STYLES[tx?.status ?? ""] ?? STATUS_STYLES.PENDING;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Transaction Tracker
        </h1>
        <p className="text-sm text-muted-foreground">
          Look up a transaction by its Meld transaction ID
        </p>
      </div>

      <Card className="border-border/50">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder="Enter transaction ID..."
              className="font-mono text-sm"
              onKeyDown={(e) => e.key === "Enter" && lookupTransaction()}
            />
            <Button
              onClick={() => lookupTransaction()}
              disabled={loading || !txId.trim()}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shrink-0"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Look Up"
              )}
            </Button>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {recentSessions.length > 0 && !result && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentSessions.map((s, i) => (
              <button
                key={i}
                onClick={() => lookupTransaction(s.id)}
                className="w-full flex items-center justify-between text-xs bg-muted/40 hover:bg-muted/70 rounded-md px-3 py-2.5 transition-colors text-left"
              >
                <div>
                  <span className="font-medium">{s.provider}</span>
                  <span className="text-muted-foreground ml-2">
                    {s.amount} {s.fiat} → {s.crypto}
                  </span>
                </div>
                <div className="text-muted-foreground font-mono">
                  {formatDate(s.ts)}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {tx && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Transaction Details</CardTitle>
              <Badge variant="outline" className={statusClass}>
                {tx.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="ID" value={tx.id} mono />
              <Field label="Provider" value={tx.serviceProvider} />
              <Field
                label="Amount"
                value={
                  tx.sourceAmount
                    ? `${tx.sourceAmount} ${tx.sourceCurrencyCode}`
                    : undefined
                }
              />
              <Field
                label="Received"
                value={
                  tx.destinationAmount
                    ? `${tx.destinationAmount} ${tx.destinationCurrencyCode}`
                    : undefined
                }
              />
              {tx.cryptoDetails?.totalFee != null && (
                <Field
                  label="Total Fee"
                  value={`$${tx.cryptoDetails.totalFee.toFixed(2)}`}
                />
              )}
              {tx.cryptoDetails?.destinationWalletAddress && (
                <Field
                  label="Wallet"
                  value={tx.cryptoDetails.destinationWalletAddress}
                  mono
                />
              )}
              {tx.cryptoDetails?.blockchainTransactionId && (
                <Field
                  label="Blockchain TX"
                  value={tx.cryptoDetails.blockchainTransactionId}
                  mono
                  colSpan
                />
              )}
              <Field label="Created" value={formatDate(tx.createdAt)} />
              <Field label="Updated" value={formatDate(tx.updatedAt)} />
            </div>

            {result?.webhookEvents && result.webhookEvents.length > 0 && (
              <>
                <div className="text-xs font-semibold text-muted-foreground pt-2">
                  Webhook Timeline
                </div>
                <div className="space-y-2">
                  {result.webhookEvents.map((evt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-xs bg-muted/40 rounded-md px-3 py-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                      <span className="font-medium">{evt.eventType}</span>
                      <span className="text-muted-foreground ml-auto">
                        {formatDate(evt.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  colSpan,
}: {
  label: string;
  value?: string | number;
  mono?: boolean;
  colSpan?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={colSpan ? "col-span-2" : ""}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`font-medium truncate ${mono ? "font-mono text-xs" : ""}`}
        title={String(value)}
      >
        {value}
      </div>
    </div>
  );
}

function formatDate(d?: string) {
  if (!d) return undefined;
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}
