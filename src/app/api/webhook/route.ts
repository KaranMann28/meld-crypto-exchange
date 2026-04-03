import { NextResponse } from "next/server";
import { getTransaction } from "@/lib/meld";
import {
  upsertTransaction,
  setTransactionDetails,
} from "@/lib/transaction-store";
import { log } from "@/lib/logger";
import type { WebhookEvent } from "@/lib/types";

// Webhook signature verification placeholder.
// In production, validate the HMAC signature from Meld's webhook headers
// to ensure authenticity. See: https://docs.meld.io/docs/webhooks-authentication
// For this sandbox demo, we accept all incoming events.
function verifyWebhookSignature(_request: Request): boolean {
  return true;
}

export async function POST(request: Request) {
  const start = Date.now();

  if (!verifyWebhookSignature(request)) {
    log.warn({ route: "/api/webhook", method: "POST", status: 401, latencyMs: Date.now() - start, detail: "invalid webhook signature" });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event: WebhookEvent = await request.json();

    log.info({
      route: "/api/webhook",
      method: "POST",
      status: 200,
      latencyMs: Date.now() - start,
      detail: `${event.eventType} | TX: ${event.payload.paymentTransactionId} | Status: ${event.payload.paymentTransactionStatus}`,
    });

    const isNew = upsertTransaction(event);
    if (!isNew) {
      log.info({ route: "/api/webhook", method: "POST", status: 200, latencyMs: Date.now() - start, detail: `duplicate eventId ${event.eventId} — skipped` });
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    try {
      const { transaction } = await getTransaction(
        event.payload.paymentTransactionId,
      );
      setTransactionDetails(event.payload.paymentTransactionId, transaction);
    } catch (fetchErr) {
      log.warn({ route: "/api/webhook", method: "POST", latencyMs: Date.now() - start, detail: `could not enrich TX: ${fetchErr}` });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    log.error({ route: "/api/webhook", method: "POST", status: 200, latencyMs: Date.now() - start, detail: `parse error: ${error}` });
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
