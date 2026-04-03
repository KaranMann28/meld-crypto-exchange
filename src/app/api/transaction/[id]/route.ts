import { NextResponse } from "next/server";
import { getTransaction, MeldAPIError } from "@/lib/meld";
import {
  getStoredTransaction,
  setTransactionDetails,
} from "@/lib/transaction-store";
import { log } from "@/lib/logger";

const TX_ID_PATTERN = /^[a-zA-Z0-9_-]{5,64}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const start = Date.now();
  try {
    const { id } = await params;

    if (!TX_ID_PATTERN.test(id)) {
      log.warn({ route: "/api/transaction", method: "GET", status: 400, latencyMs: Date.now() - start, detail: `invalid ID format: ${id}` });
      return NextResponse.json(
        { error: "Invalid transaction ID format" },
        { status: 400 },
      );
    }

    const stored = getStoredTransaction(id);

    try {
      const { transaction } = await getTransaction(id);
      setTransactionDetails(id, transaction);
      log.info({ route: "/api/transaction", method: "GET", status: 200, latencyMs: Date.now() - start, detail: `${id} status=${transaction.status}` });
      return NextResponse.json({
        transaction,
        webhookEvents: stored?.events ?? [],
      });
    } catch {
      if (stored) {
        log.info({ route: "/api/transaction", method: "GET", status: 200, latencyMs: Date.now() - start, detail: `${id} from store (status=${stored.status})` });
        return NextResponse.json({
          transaction: stored.details ?? {
            id: stored.id,
            status: stored.status,
          },
          webhookEvents: stored.events,
        });
      }
      log.warn({ route: "/api/transaction", method: "GET", status: 404, latencyMs: Date.now() - start, detail: id });
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }
  } catch (error) {
    if (error instanceof MeldAPIError) {
      log.error({ route: "/api/transaction", method: "GET", status: error.status, latencyMs: Date.now() - start, detail: error.message });
      return NextResponse.json(
        { error: error.message },
        { status: error.status >= 500 ? 502 : error.status },
      );
    }
    log.error({ route: "/api/transaction", method: "GET", status: 500, latencyMs: Date.now() - start, detail: String(error) });
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 },
    );
  }
}
