import { NextResponse } from "next/server";
import { getCryptoQuote, MeldAPIError } from "@/lib/meld";
import type { QuoteRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body: QuoteRequest = await request.json();

    if (
      !body.countryCode ||
      !body.sourceCurrencyCode ||
      !body.destinationCurrencyCode ||
      !body.sourceAmount
    ) {
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

    return NextResponse.json(quotes);
  } catch (error) {
    if (error instanceof MeldAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status >= 500 ? 502 : error.status },
      );
    }
    console.error("Quote API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 },
    );
  }
}
