import { NextResponse } from "next/server";
import { getTransaction } from "@/lib/meld";
import {
  getStoredTransaction,
  setTransactionDetails,
} from "@/lib/transaction-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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
    console.error("Transaction fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 },
    );
  }
}
