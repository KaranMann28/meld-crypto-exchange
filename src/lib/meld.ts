import type {
  MeldCountry,
  CountryDefaults,
  FiatCurrency,
  CryptoCurrency,
  PaymentMethod,
  QuoteRequest,
  QuoteResponse,
  SessionRequest,
  SessionResponse,
  TransactionDetails,
} from "./types";

const API_BASE = process.env.MELD_API_BASE_URL || "https://api-sb.meld.io";
const API_KEY = process.env.MELD_API_KEY || "";
const API_VERSION = process.env.MELD_API_VERSION || "2026-02-03";

class MeldAPIError extends Error {
  constructor(
    public status: number,
    public endpoint: string,
    message: string,
  ) {
    super(`Meld API Error (${status}) at ${endpoint}: ${message}`);
    this.name = "MeldAPIError";
  }
}

async function meldFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `BASIC ${API_KEY}`,
      "Content-Type": "application/json",
      "Meld-Version": API_VERSION,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "Unknown error");
    throw new MeldAPIError(res.status, path, body);
  }

  return res.json();
}

export async function getCountries(): Promise<MeldCountry[]> {
  return meldFetch<MeldCountry[]>(
    "/service-providers/properties/countries?accountFilter=true",
  );
}

export async function getCountryDefaults(
  countryCode: string,
): Promise<CountryDefaults[]> {
  return meldFetch<CountryDefaults[]>(
    `/service-providers/properties/defaults/by-country?countries=${countryCode}`,
  );
}

export async function getFiatCurrencies(
  countryCode: string,
): Promise<FiatCurrency[]> {
  return meldFetch<FiatCurrency[]>(
    `/service-providers/properties/fiat-currencies?countries=${countryCode}&accountFilter=true`,
  );
}

export async function getCryptoCurrencies(
  countryCode: string,
): Promise<CryptoCurrency[]> {
  const data = await meldFetch<CryptoCurrency[]>(
    `/service-providers/properties/crypto-currencies?countries=${countryCode}&accountFilter=true`,
  );
  return Array.isArray(data) ? data : [];
}

export async function getPaymentMethods(
  fiatCurrency: string,
): Promise<PaymentMethod[]> {
  return meldFetch<PaymentMethod[]>(
    `/service-providers/properties/payment-methods?fiatCurrencies=${fiatCurrency}&accountFilter=true`,
  );
}

export async function getPurchaseLimits(): Promise<
  Record<string, { minAmount: number; maxAmount: number }>
> {
  return meldFetch(
    "/service-providers/limits/fiat-currency-purchases?accountFilter=true",
  );
}

export async function getCryptoQuote(
  request: QuoteRequest,
): Promise<QuoteResponse> {
  return meldFetch<QuoteResponse>("/payments/crypto/quote", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function createWidgetSession(
  request: SessionRequest,
): Promise<SessionResponse> {
  return meldFetch<SessionResponse>("/crypto/session/widget", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getTransaction(
  transactionId: string,
): Promise<{ transaction: TransactionDetails }> {
  return meldFetch(`/payments/transactions/${transactionId}`);
}
