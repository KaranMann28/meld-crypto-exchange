import type { WebhookEvent, TransactionDetails } from "./types";

interface StoredTransaction {
  id: string;
  status: string;
  events: WebhookEvent[];
  details?: TransactionDetails;
  updatedAt: string;
}

const store = new Map<string, StoredTransaction>();
const processedEventIds = new Set<string>();

export function upsertTransaction(event: WebhookEvent): boolean {
  if (processedEventIds.has(event.eventId)) {
    return false;
  }
  processedEventIds.add(event.eventId);

  const txId = event.payload.paymentTransactionId;
  const existing = store.get(txId);

  store.set(txId, {
    id: txId,
    status: event.payload.paymentTransactionStatus,
    events: [...(existing?.events ?? []), event],
    details: existing?.details,
    updatedAt: event.timestamp,
  });

  return true;
}

export function setTransactionDetails(
  txId: string,
  details: TransactionDetails,
) {
  const existing = store.get(txId);
  if (existing) {
    existing.details = details;
    existing.status = details.status;
    store.set(txId, existing);
  } else {
    store.set(txId, {
      id: txId,
      status: details.status,
      events: [],
      details,
      updatedAt: details.updatedAt,
    });
  }
}

export function getStoredTransaction(txId: string) {
  return store.get(txId) ?? null;
}

export function getRecentTransactions(limit = 20) {
  return Array.from(store.values())
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, limit);
}
