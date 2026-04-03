import { NextResponse } from "next/server";
import { getTransaction, MeldAPIError } from "@/lib/meld";
import {
  getStoredTransaction,
  setTransactionDetails,
} from "@/lib/transaction-store";

const TX_ID_PATTERN = /^[a-zA-Z0-9_-]{5,64}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!TX_ID_PATTERN.test(id)) {
      return NextResponse.json(
        { error: "Invalid transaction ID format" },
        { status: 400 },
      );
    }

    const stored = getStoredTransaction(id);

    try {
      const { transaction } = await getTransaction(id);
      setTransactionDetails(id, transaction);
      return NextResponse.json({
        transaction,
        webhookEvents: stored?.events ?? [],
      });
    } catch {
      if (stored) {
        return NextResponse.json({
          transaction: stored.details ?? {
            id: stored.id,
            status: stored.status,
          },
          webhookEvents: stored.events,
        });
      }
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }
  } catch (error) {
    if (error instanceof MeldAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status >= 500 ? 502 : error.status },
      );
    }
    console.error("Transaction fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 },
    );
  }
}
