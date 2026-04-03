import { NextResponse } from "next/server";
import { getTransaction } from "@/lib/meld";
import {
  upsertTransaction,
  setTransactionDetails,
} from "@/lib/transaction-store";
import type { WebhookEvent } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const event: WebhookEvent = await request.json();
    console.log(
      `[Webhook] ${event.eventType} | TX: ${event.payload.paymentTransactionId} | Status: ${event.payload.paymentTransactionStatus}`,
    );

    upsertTransaction(event);

    try {
      const { transaction } = await getTransaction(
        event.payload.paymentTransactionId,
      );
      setTransactionDetails(event.payload.paymentTransactionId, transaction);
    } catch (fetchErr) {
      console.warn("[Webhook] Could not fetch transaction details:", fetchErr);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
