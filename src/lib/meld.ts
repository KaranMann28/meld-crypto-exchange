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

const ERROR_MESSAGES: Record<number, string> = {
  401: "Invalid API key or authentication failed",
  403: "Access forbidden — check account permissions",
  429: "Rate limit exceeded — please wait and retry",
  500: "Meld server error — please try again later",
  502: "Meld service unavailable — please try again later",
  503: "Meld service unavailable — please try again later",
};

export class MeldAPIError extends Error {
  constructor(
    public status: number,
    public endpoint: string,
    public rawBody: string,
  ) {
    super(ERROR_MESSAGES[status] || `Unexpected error (${status})`);
    this.name = "MeldAPIError";
  }
}

// --- TTL cache for static data (Meld recommends 1-week cache) ---
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const cache = new Map<string, { data: unknown; ts: number }>();

function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return Promise.resolve(hit.data as T);
  return fn().then((data) => {
    cache.set(key, { data, ts: Date.now() });
    return data;
  });
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
  return cached("countries", () =>
    meldFetch<MeldCountry[]>(
      "/service-providers/properties/countries?accountFilter=true",
    ),
  );
}

export async function getCountryDefaults(
  countryCode: string,
): Promise<CountryDefaults[]> {
  return cached(`defaults:${countryCode}`, () =>
    meldFetch<CountryDefaults[]>(
      `/service-providers/properties/defaults/by-country?countries=${countryCode}`,
    ),
  );
}

export async function getFiatCurrencies(
  countryCode: string,
): Promise<FiatCurrency[]> {
  return cached(`fiat:${countryCode}`, () =>
    meldFetch<FiatCurrency[]>(
      `/service-providers/properties/fiat-currencies?countries=${countryCode}&accountFilter=true`,
    ),
  );
}

export async function getCryptoCurrencies(
  countryCode: string,
): Promise<CryptoCurrency[]> {
  return cached(`crypto:${countryCode}`, async () => {
    const data = await meldFetch<CryptoCurrency[]>(
      `/service-providers/properties/crypto-currencies?countries=${countryCode}&accountFilter=true`,
    );
    return Array.isArray(data) ? data : [];
  });
}

export async function getPaymentMethods(
  fiatCurrency: string,
): Promise<PaymentMethod[]> {
  return cached(`pm:${fiatCurrency}`, () =>
    meldFetch<PaymentMethod[]>(
      `/service-providers/properties/payment-methods?fiatCurrencies=${fiatCurrency}&accountFilter=true`,
    ),
  );
}

export async function getPurchaseLimits(): Promise<
  Record<string, { minAmount: number; maxAmount: number }>
> {
  return cached("limits", () =>
    meldFetch(
      "/service-providers/limits/fiat-currency-purchases?accountFilter=true",
    ),
  );
}

// --- Real-time calls (never cached) ---

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
