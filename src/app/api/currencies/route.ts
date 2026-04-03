import { NextResponse } from "next/server";
import {
  getFiatCurrencies,
  getCryptoCurrencies,
  getPaymentMethods,
  getPurchaseLimits,
  MeldAPIError,
} from "@/lib/meld";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("country") || "US";
    const type = searchParams.get("type");

    if (type === "fiat") {
      const currencies = await getFiatCurrencies(countryCode);
      return NextResponse.json(currencies);
    }

    if (type === "crypto") {
      const currencies = await getCryptoCurrencies(countryCode);
      return NextResponse.json(currencies);
    }

    if (type === "payment-methods") {
      const fiat = searchParams.get("fiat") || "USD";
      const methods = await getPaymentMethods(fiat);
      return NextResponse.json(methods);
    }

    if (type === "limits") {
      const limits = await getPurchaseLimits();
      return NextResponse.json(limits);
    }

    const [fiat, crypto] = await Promise.all([
      getFiatCurrencies(countryCode),
      getCryptoCurrencies(countryCode),
    ]);

    return NextResponse.json({ fiat, crypto });
  } catch (error) {
    if (error instanceof MeldAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status >= 500 ? 502 : error.status },
      );
    }
    console.error("Currencies API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch currencies" },
      { status: 500 },
    );
  }
}
