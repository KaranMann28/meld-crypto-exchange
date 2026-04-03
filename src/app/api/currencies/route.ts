import { NextResponse } from "next/server";
import {
  getFiatCurrencies,
  getCryptoCurrencies,
  getPaymentMethods,
  getPurchaseLimits,
  getSellLimits,
  MeldAPIError,
} from "@/lib/meld";
import { log } from "@/lib/logger";

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("country") || "US";
    const type = searchParams.get("type");

    if (type === "fiat") {
      const currencies = await getFiatCurrencies(countryCode);
      log.info({ route: "/api/currencies", method: "GET", status: 200, latencyMs: Date.now() - start, detail: `fiat for ${countryCode}: ${currencies.length}` });
      return NextResponse.json(currencies);
    }

    if (type === "crypto") {
      const currencies = await getCryptoCurrencies(countryCode);
      log.info({ route: "/api/currencies", method: "GET", status: 200, latencyMs: Date.now() - start, detail: `crypto for ${countryCode}: ${currencies.length}` });
      return NextResponse.json(currencies);
    }

    if (type === "payment-methods") {
      const fiat = searchParams.get("fiat") || "USD";
      const methods = await getPaymentMethods(fiat);
      log.info({ route: "/api/currencies", method: "GET", status: 200, latencyMs: Date.now() - start, detail: `payment methods for ${fiat}: ${methods.length}` });
      return NextResponse.json(methods);
    }

    if (type === "limits") {
      const limits = await getPurchaseLimits();
      log.info({ route: "/api/currencies", method: "GET", status: 200, latencyMs: Date.now() - start, detail: "buy limits" });
      return NextResponse.json(limits);
    }

    if (type === "sell-limits") {
      const limits = await getSellLimits();
      log.info({ route: "/api/currencies", method: "GET", status: 200, latencyMs: Date.now() - start, detail: `sell limits: ${limits.length}` });
      return NextResponse.json(limits);
    }

    const [fiat, crypto] = await Promise.all([
      getFiatCurrencies(countryCode),
      getCryptoCurrencies(countryCode),
    ]);

    log.info({ route: "/api/currencies", method: "GET", status: 200, latencyMs: Date.now() - start, detail: `all for ${countryCode}` });
    return NextResponse.json({ fiat, crypto });
  } catch (error) {
    if (error instanceof MeldAPIError) {
      log.error({ route: "/api/currencies", method: "GET", status: error.status, latencyMs: Date.now() - start, detail: error.message });
      return NextResponse.json(
        { error: error.message },
        { status: error.status >= 500 ? 502 : error.status },
      );
    }
    log.error({ route: "/api/currencies", method: "GET", status: 500, latencyMs: Date.now() - start, detail: String(error) });
    return NextResponse.json(
      { error: "Failed to fetch currencies" },
      { status: 500 },
    );
  }
}
