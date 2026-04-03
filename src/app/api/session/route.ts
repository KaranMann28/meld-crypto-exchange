import { NextResponse } from "next/server";
import { createWidgetSession, MeldAPIError } from "@/lib/meld";
import { log } from "@/lib/logger";
import type { SessionRequest } from "@/lib/types";

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const body: SessionRequest = await request.json();

    const d = body.sessionData;
    const missing: string[] = [];
    if (!d?.walletAddress) missing.push("walletAddress");
    if (!d?.serviceProvider) missing.push("serviceProvider");
    if (!d?.destinationCurrencyCode) missing.push("destinationCurrencyCode");
    if (!d?.sourceCurrencyCode) missing.push("sourceCurrencyCode");
    if (!d?.sourceAmount) missing.push("sourceAmount");
    if (!d?.countryCode) missing.push("countryCode");
    if (!body.sessionType) missing.push("sessionType");

    if (missing.length > 0) {
      log.warn({ route: "/api/session", method: "POST", status: 400, latencyMs: Date.now() - start, detail: `missing: ${missing.join(", ")}` });
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    body.sessionData.redirectUrl =
      body.sessionData.redirectUrl || `${appUrl}/transaction/complete`;

    body.externalSessionId =
      body.externalSessionId || `session_${Date.now()}`;
    body.externalCustomerId =
      body.externalCustomerId || `customer_${Date.now()}`;

    const session = await createWidgetSession(body);
    log.info({ route: "/api/session", method: "POST", status: 200, latencyMs: Date.now() - start, detail: `session ${session.id} via ${d.serviceProvider}` });
    return NextResponse.json(session);
  } catch (error) {
    if (error instanceof MeldAPIError) {
      log.error({ route: "/api/session", method: "POST", status: error.status, latencyMs: Date.now() - start, detail: error.message });
      return NextResponse.json(
        { error: error.message },
        { status: error.status >= 500 ? 502 : error.status },
      );
    }
    log.error({ route: "/api/session", method: "POST", status: 500, latencyMs: Date.now() - start, detail: String(error) });
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}
