"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenSelector } from "@/components/token-selector";
import { SettingsPopover } from "@/components/settings-popover";
import { AmountField } from "@/components/amount-field";
import { SwapArrow } from "@/components/swap-arrow";
import { QuoteDetails } from "@/components/quote-details";
import { ProviderCard } from "@/components/provider-card";
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

const TEST_WALLETS: Record<string, string> = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0xd72cc3468979360e31bc83b84f0887deccfd81d5",
  USDC: "0xd72cc3468979360e31bc83b84f0887deccfd81d5",
};

function getTestWallet(code: string): string {
  return TEST_WALLETS[code.split("_")[0]] || TEST_WALLETS.ETH;
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
  const [error, setError] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState<string | null>(null);
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState(false);

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

        setFiatCurrencies(Array.isArray(fiatRes) ? fiatRes : []);

        const cryptoList = sortCryptos(Array.isArray(cryptoRes) ? cryptoRes : []);
        setCryptos(cryptoList);
        if (cryptoList.length > 0) {
          const btc = cryptoList.find((c) => c.currencyCode === "BTC");
          setSelectedCrypto(btc?.currencyCode || cryptoList[0].currencyCode);
        }
      } catch (err) {
        console.error("Init error:", err);
        setError("Failed to load. Check your API key.");
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

  const handleCountryChange = useCallback(async (code: string) => {
    setCountryCode(code);
    setQuotes([]);
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
    }
  }, [selectedCrypto]);

  const handleFiatChange = useCallback((code: string) => {
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
      setAmountError(`Min: ${lim.minAmount} ${fiatCurrency}`);
      return false;
    } else if (num > lim.maxAmount) {
      setAmountError(`Max: ${lim.maxAmount.toLocaleString()} ${fiatCurrency}`);
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
          setError("No quotes available. Try a different amount, token, or payment method.");
        }
      }
    } catch {
      setError("Failed to fetch quotes");
    } finally {
      setLoadingQuotes(false);
    }
  }, [amount, countryCode, fiatCurrency, selectedCrypto, selectedPayment, walletAddress]);

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
        if (session.error) { setError(session.error); return; }

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
        } catch { /* noop */ }

        const url = session.serviceProviderWidgetUrl || session.widgetUrl;
        if (url) window.open(url, "meld-widget", "width=460,height=720,scrollbars=yes,resizable=yes");
      } catch {
        setError("Failed to create session");
      } finally {
        setCreatingSession(null);
      }
    },
    [countryCode, fiatCurrency, selectedCrypto, walletAddress],
  );

  const selectedToken = cryptos.find((c) => c.currencyCode === selectedCrypto);
  const bestQuote = quotes[0] ?? null;
  const worstAmount = quotes.length > 1 ? Math.min(...quotes.map((q) => q.destinationAmount)) : null;

  const fiatEquiv = bestQuote
    ? `~$${bestQuote.fiatAmountWithoutFees?.toFixed(2) ?? bestQuote.sourceAmountWithoutFees?.toFixed(2) ?? ""}`
    : "";

  const receiveAmount = bestQuote ? bestQuote.destinationAmount.toFixed(8) : "";
  const receiveEquiv = bestQuote
    ? `~$${(bestQuote.sourceAmount - bestQuote.totalFee).toFixed(2)} after fees`
    : "";

  const buttonLabel = !amount || parseFloat(amount) <= 0
    ? "Enter an amount"
    : !selectedCrypto
      ? "Select a token"
      : loadingQuotes
        ? "Fetching quotes..."
        : quotes.length > 0
          ? `Buy ${selectedCrypto.split("_")[0]}`
          : "Get Quotes";

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-[480px] mx-auto px-4">
          <div className="rounded-3xl bg-card/80 backdrop-blur-xl border border-border/30 p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-center min-h-[calc(100vh-8rem)] pt-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[480px] mx-auto px-4 space-y-4"
        >
          {/* Main Exchange Card */}
          <div className="rounded-3xl bg-card/80 backdrop-blur-xl border border-border/30 p-6 space-y-3 shadow-2xl shadow-violet-500/[0.03]">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Buy Crypto</h1>
                <p className="text-[11px] text-muted-foreground">Compare providers instantly</p>
              </div>
            <SettingsPopover
              countries={countries}
              countryCode={countryCode}
              onCountryChange={handleCountryChange}
              fiatCurrencies={fiatCurrencies}
              fiatCurrency={fiatCurrency}
              onFiatChange={handleFiatChange}
              paymentMethods={paymentMethods}
              selectedPayment={selectedPayment}
              onPaymentChange={setSelectedPayment}
            />
          </div>

          {/* You Pay */}
          <AmountField
            label="You pay"
            amount={amount}
            onAmountChange={handleAmountChange}
            fiatEquivalent={amount ? `~$${parseFloat(amount || "0").toFixed(2)}` : ""}
            tokenCode={fiatCurrency}
            isFiat
            error={amountError}
          />

          <SwapArrow />

          {/* You Receive */}
          <AmountField
            label="You receive"
            amount={loadingQuotes ? "" : receiveAmount}
            readOnly
            shimmer={loadingQuotes}
            fiatEquivalent={receiveEquiv}
            tokenCode={selectedCrypto}
            tokenName={selectedToken?.name}
            tokenIcon={selectedToken?.symbolImageUrl}
            onTokenClick={() => setTokenSelectorOpen(true)}
            rightLabel={bestQuote ? `via ${bestQuote.serviceProvider}` : undefined}
          />

          {/* Wallet */}
          <div className="rounded-2xl bg-accent/50 dark:bg-white/[0.03] px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-medium">Wallet address</span>
              {!walletAddress && (
                <button
                  onClick={() => setWalletAddress(getTestWallet(selectedCrypto))}
                  className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Use test address
                </button>
              )}
            </div>
            <input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x... or bc1..."
              className="w-full h-9 bg-transparent font-mono text-xs outline-none placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Quote Details */}
          {bestQuote && <QuoteDetails quote={bestQuote} />}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5"
            >
              {error}
            </motion.div>
          )}

          {/* Action Button */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => fetchQuotes()}
              disabled={loadingQuotes || !amount || !selectedCrypto || !!amountError}
              className="w-full h-[56px] text-base font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all"
            >
              {loadingQuotes ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Fetching quotes...
                </span>
              ) : (
                buttonLabel
              )}
            </Button>
          </motion.div>
        </div>

        {/* Provider Cards */}
        {quotes.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium">
                {quotes.length} provider{quotes.length !== 1 ? "s" : ""}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Ranked by rampScore
              </span>
            </div>

            {quotes.map((quote, i) => (
              <ProviderCard
                key={`${quote.serviceProvider}-${i}`}
                quote={quote}
                index={i}
                isTop={i === 0}
                worstAmount={worstAmount}
                onSelect={() => launchProvider(quote)}
                loading={creatingSession === quote.serviceProvider}
              />
            ))}
          </div>
        )}
        </motion.div>
      </div>

      <TokenSelector
        open={tokenSelectorOpen}
        onOpenChange={setTokenSelectorOpen}
        tokens={cryptos}
        selected={selectedCrypto}
        onSelect={setSelectedCrypto}
      />
    </>
  );
}
