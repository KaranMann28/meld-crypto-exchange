import { NextResponse } from "next/server";
import { getRecentTransactions } from "@/lib/transaction-store";
import { log } from "@/lib/logger";

export async function GET(request: Request) {
  const start = Date.now();
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

  const transactions = getRecentTransactions(limit);
  log.info({ route: "/api/transactions", method: "GET", status: 200, latencyMs: Date.now() - start, detail: `${transactions.length} recent` });
  return NextResponse.json(transactions);
}
