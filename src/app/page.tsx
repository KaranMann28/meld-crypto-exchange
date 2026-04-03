"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCryptoIconUrl, getFiatFlag, getProviderColor } from "@/lib/crypto-icons";
import type {
  MeldCountry,
  FiatCurrency,
  CryptoCurrency,
  CryptoQuote,
  CountryDefaults,
  PaymentMethod,
} from "@/lib/types";

const SANDBOX_TOKENS = ["BTC", "ETH", "USDC"];

function sortCryptos(list: CryptoCurrency[]): CryptoCurrency[] {
  const sandbox: CryptoCurrency[] = [];
  const rest: CryptoCurrency[] = [];
  for (const c of list) {
    if (SANDBOX_TOKENS.includes(c.currencyCode)) sandbox.push(c);
    else rest.push(c);
  }
  return [...sandbox, ...rest];
}

export default function ExchangePage() {
  const [countries, setCountries] = useState<MeldCountry[]>([]);
  const [countryCode, setCountryCode] = useState("US");
  const [defaults, setDefaults] = useState<CountryDefaults | null>(null);
  const [fiatCurrencies, setFiatCurrencies] = useState<FiatCurrency[]>([]);
  const [fiatCurrency, setFiatCurrency] = useState("USD");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [cryptos, setCryptos] = useState<CryptoCurrency[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [amount, setAmount] = useState("100");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [limits, setLimits] = useState<Record<string, { minAmount: number; maxAmount: number }> | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [quotes, setQuotes] = useState<CryptoQuote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingCountry, setLoadingCountry] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [countriesRes, defaultsRes, cryptoRes, fiatRes, limitsRes] =
          await Promise.all([
            fetch("/api/countries").then((r) => r.json()),
            fetch("/api/countries?defaults=US").then((r) => r.json()),
            fetch("/api/currencies?country=US&type=crypto").then((r) => r.json()),
            fetch("/api/currencies?country=US&type=fiat").then((r) => r.json()),
            fetch("/api/currencies?type=limits").then((r) => r.json()),
          ]);

        setCountries(Array.isArray(countriesRes) ? countriesRes : []);
        setLimits(limitsRes && !limitsRes.error ? limitsRes : null);

        if (Array.isArray(defaultsRes) && defaultsRes.length > 0) {
          setDefaults(defaultsRes[0]);
          const defCurrency = defaultsRes[0].defaultCurrencyCode || "USD";
          setFiatCurrency(defCurrency);
          setSelectedPayment(defaultsRes[0].defaultPaymentMethods?.[0] || "");
          loadPaymentMethods(defCurrency);
        }

        const fiatList = Array.isArray(fiatRes) ? fiatRes : [];
        setFiatCurrencies(fiatList);

        const cryptoList = sortCryptos(Array.isArray(cryptoRes) ? cryptoRes : []);
        setCryptos(cryptoList);
        if (cryptoList.length > 0) {
          const btc = cryptoList.find((c) => c.currencyCode === "BTC");
          setSelectedCrypto(btc?.currencyCode || cryptoList[0].currencyCode);
        }
      } catch (err) {
        console.error("Init error:", err);
        setError("Failed to load initial data. Check your API key.");
      } finally {
        setLoadingInit(false);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPaymentMethods(fiat: string) {
    try {
      const res = await fetch(`/api/currencies?type=payment-methods&fiat=${fiat}`);
      const data = await res.json();
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch {
      setPaymentMethods([]);
    }
  }

  const handleCountryChange = useCallback(async (code: string | null) => {
    if (!code) return;
    setCountryCode(code);
    setQuotes([]);
    setLoadingCountry(true);
    try {
      const [defaultsRes, cryptoRes, fiatRes] = await Promise.all([
        fetch(`/api/countries?defaults=${code}`).then((r) => r.json()),
        fetch(`/api/currencies?country=${code}&type=crypto`).then((r) => r.json()),
        fetch(`/api/currencies?country=${code}&type=fiat`).then((r) => r.json()),
      ]);
      if (Array.isArray(defaultsRes) && defaultsRes.length > 0) {
        setDefaults(defaultsRes[0]);
        const defCurrency = defaultsRes[0].defaultCurrencyCode || "USD";
        setFiatCurrency(defCurrency);
        setSelectedPayment(defaultsRes[0].defaultPaymentMethods?.[0] || "");
        loadPaymentMethods(defCurrency);
      }
      setFiatCurrencies(Array.isArray(fiatRes) ? fiatRes : []);
      const cryptoList = sortCryptos(Array.isArray(cryptoRes) ? cryptoRes : []);
      setCryptos(cryptoList);
      if (cryptoList.length > 0 && !cryptoList.find((c) => c.currencyCode === selectedCrypto)) {
        setSelectedCrypto(cryptoList[0].currencyCode);
      }
    } catch (err) {
      console.error("Country change error:", err);
    } finally {
      setLoadingCountry(false);
    }
  }, [selectedCrypto]);

  const handleFiatChange = useCallback((code: string | null) => {
    if (!code) return;
    setFiatCurrency(code);
    setQuotes([]);
    loadPaymentMethods(code);
  }, []);

  function validateAmount(val: string): boolean {
    const num = parseFloat(val);
    if (!val || isNaN(num)) { setAmountError(null); return true; }
    if (!limits || !limits[fiatCurrency]) { setAmountError(null); return true; }
    const lim = limits[fiatCurrency];
    if (num < lim.minAmount) {
      setAmountError(`Minimum: ${lim.minAmount} ${fiatCurrency}`);
      return false;
    } else if (num > lim.maxAmount) {
      setAmountError(`Maximum: ${lim.maxAmount.toLocaleString()} ${fiatCurrency}`);
      return false;
    } else {
      setAmountError(null);
      return true;
    }
  }

  function handleAmountChange(val: string) {
    setAmount(val);
    const isValid = validateAmount(val);
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val && parseFloat(val) > 0 && selectedCrypto && isValid) {
        fetchQuotes(val);
      }
    }, 800);
  }

  const fetchQuotes = useCallback(async (overrideAmount?: string | undefined) => {
    const amt = overrideAmount ?? amount;
    if (!amt || parseFloat(amt) <= 0 || !selectedCrypto) return;
    setLoadingQuotes(true);
    setError(null);
    setQuotes([]);
    try {
      const body: Record<string, unknown> = {
        countryCode,
        sourceCurrencyCode: fiatCurrency,
        destinationCurrencyCode: selectedCrypto,
        sourceAmount: parseFloat(amt),
      };
      if (selectedPayment) body.paymentMethodType = selectedPayment;
      if (walletAddress.trim()) body.walletAddress = walletAddress.trim();

      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setQuotes(data.quotes || []);
        if (!data.quotes?.length) {
          setError("No quotes available for this combination. Try a different amount, token, or payment method.");
        }
      }
    } catch {
      setError("Failed to fetch quotes");
    } finally {
      setLoadingQuotes(false);
    }
  }, [amount, countryCode, fiatCurrency, selectedCrypto, selectedPayment]);

  const launchProvider = useCallback(
    async (quote: CryptoQuote) => {
      if (!walletAddress.trim()) {
        setError("Enter a wallet address to proceed.");
        return;
      }
      setCreatingSession(quote.serviceProvider);
      setError(null);
      try {
        const res = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionType: "BUY",
            sessionData: {
              countryCode,
              sourceCurrencyCode: fiatCurrency,
              sourceAmount: String(quote.sourceAmount),
              destinationCurrencyCode: selectedCrypto,
              walletAddress: walletAddress.trim(),
              serviceProvider: quote.serviceProvider,
              paymentMethodType: quote.paymentMethodType,
            },
          }),
        });
        const session = await res.json();
        if (session.error) {
          setError(session.error);
          return;
        }

        try {
          const prev = JSON.parse(localStorage.getItem("meld_sessions") || "[]");
          prev.unshift({
            id: session.id,
            provider: quote.serviceProvider,
            amount: quote.sourceAmount,
            fiat: fiatCurrency,
            crypto: selectedCrypto,
            ts: new Date().toISOString(),
          });
          localStorage.setItem("meld_sessions", JSON.stringify(prev.slice(0, 20)));
        } catch { /* localStorage unavailable */ }

        const url = session.serviceProviderWidgetUrl || session.widgetUrl;
        if (url) {
          window.open(url, "meld-widget", "width=460,height=720,scrollbars=yes,resizable=yes");
        }
      } catch {
        setError("Failed to create session");
      } finally {
        setCreatingSession(null);
      }
    },
    [countryCode, fiatCurrency, selectedCrypto, walletAddress],
  );

  if (loadingInit) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const worstQuote = quotes.length > 1
    ? Math.min(...quotes.map((q) => q.destinationAmount))
    : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Buy Crypto</h1>
        <p className="text-sm text-muted-foreground">
          Compare real-time prices from multiple providers
        </p>
      </div>

      <Card className="border-border/50 relative overflow-hidden">
        {loadingCountry && (
          <div className="absolute inset-0 bg-card/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <span className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
          </div>
        )}
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Country</label>
              <Select value={countryCode} onValueChange={(v) => v && handleCountryChange(v)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.countryCode} value={c.countryCode}>
                      <span className="flex items-center gap-2">
                        {c.flagImageUrl && (
                          <img src={c.flagImageUrl} alt="" className="w-4 h-3 object-cover rounded-sm" />
                        )}
                        {c.name || c.countryName}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Currency</label>
              <Select value={fiatCurrency} onValueChange={(v) => v && handleFiatChange(v)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fiatCurrencies.map((c) => (
                    <SelectItem key={c.currencyCode} value={c.currencyCode}>
                      {getFiatFlag(c.currencyCode)} {c.currencyCode}
                      {c.name && <span className="text-muted-foreground ml-1">({c.name})</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {paymentMethods.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Payment method</label>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((pm) => {
                  const key = pm.paymentMethod;
                  const active = selectedPayment === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedPayment(active ? "" : key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                          : "bg-muted/50 text-muted-foreground border-transparent hover:border-border"
                      }`}
                    >
                      {formatPaymentMethod(key)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Separator className="opacity-50" />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">You pay</label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="100"
                className={`h-14 text-2xl font-semibold pr-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  amountError ? "border-destructive" : ""
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                {fiatCurrency}
              </span>
            </div>
            {amountError && (
              <p className="text-xs text-destructive">{amountError}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">You receive</label>
            <Select value={selectedCrypto} onValueChange={(v) => v && setSelectedCrypto(v)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {cryptos.map((c) => {
                  const isSandbox = SANDBOX_TOKENS.includes(c.currencyCode);
                  return (
                    <SelectItem key={c.currencyCode} value={c.currencyCode}>
                      <span className="flex items-center gap-2">
                        <img
                          src={c.symbolImageUrl || getCryptoIconUrl(c.currencyCode)}
                          alt={c.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="font-medium">{c.name || c.currencyName}</span>
                        <span className="text-muted-foreground text-xs">{c.chainName || c.networkName}</span>
                        {isSandbox && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/20">
                            Sandbox
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Wallet address</label>
              {!walletAddress && (
                <button
                  onClick={() => setWalletAddress(getTestWallet(selectedCrypto))}
                  className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Use test address
                </button>
              )}
            </div>
            <Input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x... or bc1..."
              className="h-10 font-mono text-xs"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <Button
            onClick={() => fetchQuotes()}
            disabled={loadingQuotes || !amount || !selectedCrypto || !!amountError}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
          >
            {loadingQuotes ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Fetching quotes...
              </span>
            ) : (
              "Get Quotes"
            )}
          </Button>
        </CardContent>
      </Card>

      {quotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold">
              {quotes.length} Provider{quotes.length !== 1 ? "s" : ""} Found
            </h2>
            <span className="text-xs text-muted-foreground">
              Ranked by Meld rampScore
            </span>
          </div>

          {quotes.map((quote, i) => (
            <QuoteCard
              key={`${quote.serviceProvider}-${i}`}
              quote={quote}
              isTop={i === 0}
              worstAmount={worstQuote}
              onSelect={() => launchProvider(quote)}
              loading={creatingSession === quote.serviceProvider}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QuoteCard({
  quote,
  isTop,
  worstAmount,
  onSelect,
  loading,
}: {
  quote: CryptoQuote;
  isTop: boolean;
  worstAmount: number | null;
  onSelect: () => void;
  loading: boolean;
}) {
  const providerColor = getProviderColor(quote.serviceProvider);

  const pctBetter =
    isTop && worstAmount && worstAmount > 0
      ? (((quote.destinationAmount - worstAmount) / worstAmount) * 100).toFixed(1)
      : null;

  return (
    <Card
      className={`border transition-all hover:border-violet-500/40 ${
        isTop ? "border-violet-500/30 shadow-lg shadow-violet-500/5" : "border-border/50"
      }`}
    >
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: providerColor }}
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
                    Best Match
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <span title="rampScore measures conversion likelihood based on provider reliability, payment method compatibility, and historical success rates for this region">
                  Score: {quote.rampIntelligence?.rampScore?.toFixed(1) ?? "N/A"}
                </span>
                {quote.rampIntelligence?.lowKyc && " · Low KYC"}
                {quote.paymentMethodType && (
                  <span> · {formatPaymentMethod(quote.paymentMethodType)}</span>
                )}
                {pctBetter && parseFloat(pctBetter) > 0 && (
                  <span className="text-green-400 ml-1">· +{pctBetter}% vs lowest</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-base">
              {quote.destinationAmount?.toFixed(8)}{" "}
              <span className="text-xs text-muted-foreground">
                {quote.destinationCurrencyCode}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              1 {quote.destinationCurrencyCode.split("_")[0]} ={" "}
              {quote.exchangeRate?.toLocaleString()} {quote.sourceCurrencyCode}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <FeeCell label="Total Fee" value={quote.totalFee} />
          <FeeCell label="Network" value={quote.networkFee} />
          <FeeCell label="Provider" value={quote.transactionFee} />
          <FeeCell label="Partner" value={quote.partnerFee} />
        </div>

        <Button
          onClick={onSelect}
          disabled={loading}
          variant="outline"
          className="w-full h-9 text-sm hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/30"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
              Opening...
            </span>
          ) : (
            `Buy with ${quote.serviceProvider}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function FeeCell({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="bg-muted/50 rounded-md px-2 py-1.5">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{value != null ? `$${value.toFixed(2)}` : "—"}</div>
    </div>
  );
}

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_DEBIT_CARD: "Card",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
  SEPA: "SEPA",
  PIX: "PIX",
  ACH: "ACH",
  BANK_TRANSFER: "Bank Transfer",
};

function formatPaymentMethod(key: string): string {
  return PAYMENT_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const TEST_WALLETS: Record<string, string> = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0xd72cc3468979360e31bc83b84f0887deccfd81d5",
  USDC: "0xd72cc3468979360e31bc83b84f0887deccfd81d5",
};

function getTestWallet(cryptoCode: string): string {
  const base = cryptoCode.split("_")[0];
  return TEST_WALLETS[base] || TEST_WALLETS.ETH;
}
