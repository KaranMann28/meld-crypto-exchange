"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CryptoCurrency,
  CryptoQuote,
  CountryDefaults,
} from "@/lib/types";

export default function ExchangePage() {
  const [countries, setCountries] = useState<MeldCountry[]>([]);
  const [countryCode, setCountryCode] = useState("US");
  const [defaults, setDefaults] = useState<CountryDefaults | null>(null);
  const [cryptos, setCryptos] = useState<CryptoCurrency[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [fiatCurrency, setFiatCurrency] = useState("USD");
  const [amount, setAmount] = useState("100");
  const [walletAddress, setWalletAddress] = useState("");
  const [quotes, setQuotes] = useState<CryptoQuote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [countriesRes, defaultsRes, cryptoRes] = await Promise.all([
          fetch("/api/countries").then((r) => r.json()),
          fetch("/api/countries?defaults=US").then((r) => r.json()),
          fetch("/api/currencies?country=US&type=crypto").then((r) => r.json()),
        ]);
        setCountries(Array.isArray(countriesRes) ? countriesRes : []);
        if (Array.isArray(defaultsRes) && defaultsRes.length > 0) {
          setDefaults(defaultsRes[0]);
          setFiatCurrency(defaultsRes[0].defaultCurrencyCode || "USD");
        }
        const cryptoList = Array.isArray(cryptoRes) ? cryptoRes : [];
        setCryptos(cryptoList);
        if (cryptoList.length > 0) {
          const btc = cryptoList.find(
            (c: CryptoCurrency) => c.currencyCode === "BTC",
          );
          const eth = cryptoList.find(
            (c: CryptoCurrency) => c.currencyCode === "ETH",
          );
          setSelectedCrypto(btc?.currencyCode || eth?.currencyCode || cryptoList[0].currencyCode);
        }
      } catch (err) {
        console.error("Init error:", err);
        setError("Failed to load initial data. Check your API key.");
      } finally {
        setLoadingInit(false);
      }
    }
    init();
  }, []);

  const handleCountryChange = useCallback(async (code: string) => {
    setCountryCode(code);
    setQuotes([]);
    try {
      const [defaultsRes, cryptoRes] = await Promise.all([
        fetch(`/api/countries?defaults=${code}`).then((r) => r.json()),
        fetch(`/api/currencies?country=${code}&type=crypto`).then((r) => r.json()),
      ]);
      if (Array.isArray(defaultsRes) && defaultsRes.length > 0) {
        setDefaults(defaultsRes[0]);
        setFiatCurrency(defaultsRes[0].defaultCurrencyCode || "USD");
      }
      const cryptoList = Array.isArray(cryptoRes) ? cryptoRes : [];
      setCryptos(cryptoList);
      if (cryptoList.length > 0 && !cryptoList.find((c: CryptoCurrency) => c.currencyCode === selectedCrypto)) {
        setSelectedCrypto(cryptoList[0].currencyCode);
      }
    } catch (err) {
      console.error("Country change error:", err);
    }
  }, [selectedCrypto]);

  const fetchQuotes = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0 || !selectedCrypto) return;
    setLoadingQuotes(true);
    setError(null);
    setQuotes([]);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode,
          sourceCurrencyCode: fiatCurrency,
          destinationCurrencyCode: selectedCrypto,
          sourceAmount: parseFloat(amount),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setQuotes(data.quotes || []);
        if (!data.quotes?.length) {
          setError("No quotes available for this combination. Try a different amount or token.");
        }
      }
    } catch (err) {
      console.error("Quote error:", err);
      setError("Failed to fetch quotes");
    } finally {
      setLoadingQuotes(false);
    }
  }, [amount, countryCode, fiatCurrency, selectedCrypto]);

  const launchProvider = useCallback(
    async (quote: CryptoQuote) => {
      if (!walletAddress.trim()) {
        setError("Please enter a wallet address to proceed.");
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
        const url = session.serviceProviderWidgetUrl || session.widgetUrl;
        if (url) {
          window.open(url, "meld-widget", "width=460,height=720,scrollbars=yes,resizable=yes");
        }
      } catch (err) {
        console.error("Session error:", err);
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
          <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Buy Crypto</h1>
        <p className="text-sm text-muted-foreground">
          Compare real-time prices from multiple providers
        </p>
      </div>

      <Card className="border-border/50">
        <CardContent className="pt-6 space-y-5">
          {/* Country + Fiat Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Country
              </label>
              <Select value={countryCode} onValueChange={handleCountryChange}>
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
              <label className="text-xs font-medium text-muted-foreground">
                Currency
              </label>
              <Select value={fiatCurrency} onValueChange={setFiatCurrency}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {defaults?.defaultCurrencyCode && (
                    <SelectItem value={defaults.defaultCurrencyCode}>
                      {getFiatFlag(defaults.defaultCurrencyCode)}{" "}
                      {defaults.defaultCurrencyCode}
                    </SelectItem>
                  )}
                  {!defaults?.defaultCurrencyCode && (
                    <SelectItem value="USD">{getFiatFlag("USD")} USD</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="opacity-50" />

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              You pay
            </label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className="h-14 text-2xl font-semibold pr-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                {fiatCurrency}
              </span>
            </div>
          </div>

          {/* Crypto Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              You receive
            </label>
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {cryptos.map((c) => (
                  <SelectItem key={c.currencyCode} value={c.currencyCode}>
                    <span className="flex items-center gap-2">
                      <img
                        src={c.symbolImageUrl || getCryptoIconUrl(c.currencyCode)}
                        alt={c.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="font-medium">{c.name || c.currencyName}</span>
                      <span className="text-muted-foreground text-xs">
                        {c.chainName || c.networkName}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wallet Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Wallet address
            </label>
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
            onClick={fetchQuotes}
            disabled={loadingQuotes || !amount || !selectedCrypto}
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

      {/* Quotes */}
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
  onSelect,
  loading,
}: {
  quote: CryptoQuote;
  isTop: boolean;
  onSelect: () => void;
  loading: boolean;
}) {
  const providerColor = getProviderColor(quote.serviceProvider);

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
                Score: {quote.rampIntelligence?.rampScore?.toFixed(1) ?? "N/A"}
                {quote.rampIntelligence?.lowKyc && " · Low KYC"}
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
          <div className="bg-muted/50 rounded-md px-2 py-1.5">
            <div className="text-muted-foreground">Total Fee</div>
            <div className="font-medium">
              ${quote.totalFee?.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted/50 rounded-md px-2 py-1.5">
            <div className="text-muted-foreground">Network</div>
            <div className="font-medium">
              ${quote.networkFee?.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted/50 rounded-md px-2 py-1.5">
            <div className="text-muted-foreground">Provider</div>
            <div className="font-medium">
              ${quote.transactionFee?.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted/50 rounded-md px-2 py-1.5">
            <div className="text-muted-foreground">Partner</div>
            <div className="font-medium">
              ${quote.partnerFee?.toFixed(2)}
            </div>
          </div>
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
