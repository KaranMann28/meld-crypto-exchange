import { NextResponse } from "next/server";
import { getCryptoQuote, MeldAPIError } from "@/lib/meld";
import { log } from "@/lib/logger";
import type { QuoteRequest } from "@/lib/types";

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const body: QuoteRequest = await request.json();

    if (
      !body.countryCode ||
      !body.sourceCurrencyCode ||
      !body.destinationCurrencyCode ||
      !body.sourceAmount
    ) {
      log.warn({ route: "/api/quote", method: "POST", status: 400, latencyMs: Date.now() - start, detail: "missing required fields" });
      return NextResponse.json(
        { error: "Missing required fields: countryCode, sourceCurrencyCode, destinationCurrencyCode, sourceAmount" },
        { status: 400 },
      );
    }

    const quotes = await getCryptoQuote(body);

    if (quotes.quotes) {
      quotes.quotes.sort((a, b) => {
        const scoreA = a.rampIntelligence?.rampScore ?? 0;
        const scoreB = b.rampIntelligence?.rampScore ?? 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return b.destinationAmount - a.destinationAmount;
      });
    }

    log.info({ route: "/api/quote", method: "POST", status: 200, latencyMs: Date.now() - start, detail: `${quotes.quotes?.length ?? 0} quotes for ${body.sourceCurrencyCode}->${body.destinationCurrencyCode}` });
    return NextResponse.json(quotes);
  } catch (error) {
    if (error instanceof MeldAPIError) {
      log.error({ route: "/api/quote", method: "POST", status: error.status, latencyMs: Date.now() - start, detail: error.message });
      return NextResponse.json(
        { error: error.message },
        { status: error.status >= 500 ? 502 : error.status },
      );
    }
    log.error({ route: "/api/quote", method: "POST", status: 500, latencyMs: Date.now() - start, detail: String(error) });
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 },
    );
  }
}
