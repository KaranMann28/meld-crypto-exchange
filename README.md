# Meld Crypto Exchange — White-Label API Integration

A full-stack crypto on-ramp integration built with **Next.js 16**, **TypeScript**, and **Meld's White-Label API**. Users can compare real-time quotes from multiple crypto providers, select the best rate, and complete a purchase — all through a single interface.

Meld's core value is **aggregation over a single provider**. Instead of integrating Transak, Moonpay, or Stripe individually (each with different coverage, pricing, and KYC flows), Meld routes through 50+ providers via one API and uses its `rampScore` algorithm to rank quotes by conversion likelihood — not just price. This integration demonstrates that pattern end-to-end.

**Live Demo:** _[Deployed on Vercel — link TBD]_

---

## What It Does

This app implements Meld's complete 7-step White-Label API flow:

1. **Country Detection** — Loads 150+ supported countries with flag icons from Meld's CDN
2. **Currency + Payment Defaults** — Sets fiat currency and payment method based on country defaults
3. **Crypto Selection** — Displays tokens with sandbox-supported ones (BTC, ETH, USDC) pinned to the top
4. **Amount Validation** — Real-time validation against Meld's min/max purchase limits per currency
5. **Quote Comparison** — Fetches live quotes from multiple providers, ranked by Meld's `rampScore`
6. **Provider Launch** — Creates a widget session and opens the provider's KYC/payment UI in a popup
7. **Transaction Tracking** — Webhook endpoint receives status updates; recent sessions persisted client-side

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Next.js App                        │
├──────────────────┬───────────────────────────────────┤
│   Frontend       │   Backend (API Routes)             │
│                  │                                    │
│   /              │   /api/countries    GET             │
│   (Exchange UI)  │   /api/currencies   GET             │
│                  │   /api/quote        POST            │
│   /transactions  │   /api/session      POST            │
│   (TX Tracker)   │   /api/transaction/[id]  GET        │
│                  │   /api/webhook      POST            │
├──────────────────┴───────────────────────────────────┤
│   /lib/meld.ts — API client w/ TTL cache + error map  │
│   /lib/types.ts — TypeScript interfaces                │
│   /lib/transaction-store.ts — In-memory TX cache       │
│   /lib/crypto-icons.ts — Token icon + provider helpers │
└──────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **API key never touches the browser.** All Meld calls proxy through Next.js API routes. The `MELD_API_KEY` env var is server-only.
- **Static data is cached server-side.** Countries, currencies, payment methods, and limits are cached with a 7-day TTL (per Meld's own recommendation in the "API Response Caching Guide").
- **Quotes are never cached.** Always fetched fresh — crypto prices move every second.
- **Quotes ranked by `rampScore`.** Meld's conversion-likelihood algorithm. Secondary sort: highest `destinationAmount` (most crypto for the user's money).
- **Webhook idempotency.** Incoming events are deduplicated by `eventId` before processing, as Meld's docs recommend.
- **Specific error messages.** HTTP 401, 403, 429, and 5xx from Meld are mapped to human-readable messages rather than generic "something went wrong."

---

## Setup & Run

### Prerequisites

- Node.js 20+
- A Meld sandbox API key

### Install

```bash
git clone https://github.com/KaranMann28/meld-crypto-exchange.git
cd meld-crypto-exchange
npm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your key:

```env
MELD_API_KEY=your_meld_sandbox_api_key
MELD_API_BASE_URL=https://api-sb.meld.io
MELD_API_VERSION=2026-02-03
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Start:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Verify API connection:

```bash
curl http://localhost:3000/api/health
# {"status":"ok","environment":"sandbox","countriesLoaded":150,...}
```

### Test a Purchase

1. Select country (US) and token (BTC — marked "Sandbox")
2. Enter amount (e.g., $100) — validates against min/max limits
3. Click **Get Quotes** — see quotes ranked by rampScore with fee breakdown
4. Click **"Use test address"** next to the wallet field (auto-fills a sandbox-safe address)
5. Click **Buy with [Provider]** — provider widget opens in popup
6. Complete KYC in the provider widget (use any fake info for sandbox)
7. Use a test card to complete payment:

| Provider | Card Number | Expiry | CVV | Notes |
|----------|------------|--------|-----|-------|
| Transak | `4111 1111 1111 1111` | `10/33` | `123` | US SSN: `000000001` |
| Unlimit | `4000 0000 0000 0085` | `10/30` | `123` | Visa test card |
| Banxa | `4111 1111 1111 1111` | `01/30` | `555` | OTP: `7203` |
| Topper | `4921 8178 4444 5119` | Any future | Any 3 | — |

---

## Assumptions

- **Sandbox only.** All calls target `api-sb.meld.io`. Sandbox supports BTC, ETH, USDC; other tokens are available via the API but may not have working providers.
- **In-memory transaction store.** Webhook events are stored in-process for demo purposes. Production would use a database.
- **No user auth.** This is a demo integration; a real product would have accounts, session management, and KYC state tracking.
- **Buy flow only.** Sell is quote-only in sandbox; transfer is config-only.

---

## Challenges Faced

**1. API response field names differ from documentation examples.**
The docs show `countryName`, `currencyName`, and `networkCode`/`networkName` in example responses, but the live API returns `name`, `chainCode`/`chainName`, and `symbolImageUrl` instead. I discovered this by inspecting actual responses, not by reading the docs alone. Every model type in `types.ts` carries both the documented and actual field names as optional properties so the UI can handle either.

**2. Select component type mismatch with Next.js 16.**
The shadcn/ui Select component generated for Next.js 16 uses Base UI under the hood, which passes `string | null` to `onValueChange` callbacks. Standard React `setState` dispatchers expect `string`. Additionally, the Base UI Button doesn't support `asChild` (a Radix primitive). Both required wrapping handlers with null guards and replacing `asChild` with standard `Link` composition.

**3. Sandbox provider availability is undocumented at the API level.**
The sandbox guide lists supported tokens (BTC, ETH, USDC) but the `/crypto-currencies` endpoint returns 200+ tokens globally. Users selecting unsupported tokens get zero quotes with no error. I solved this by pinning sandbox tokens to the top with a visual badge, so users naturally pick working options first.

**4. Fee fields can be null.**
Some providers return `null` for `networkFee` or `partnerFee` in quotes. The first version crashed when calling `.toFixed(2)` on null. I added null-safe rendering with a dash fallback for every fee cell.

**5. Webhook testing requires a public URL.**
Meld webhooks need a publicly accessible endpoint. Locally, this requires ngrok or similar. On Vercel, the API route is natively public, which solves it in production. For local dev, I used [webhook.site](https://webhook.site) to inspect payloads during development.

---

## Improvements I'd Make

1. **Persistent transaction store** — Vercel KV or Postgres for durable webhook event storage
2. **WebSocket push** — Stream transaction status changes to the frontend instead of manual lookup
3. **Sell flow** — Add the reverse path (crypto → fiat) once sandbox supports full off-ramp transactions
4. **Quote auto-refresh timer** — Visual countdown + auto-refetch every 30s to keep prices current
5. **Webhook signature verification** — Validate incoming webhook authenticity using Meld's HMAC signing
6. **Rate limiting** — Protect API routes from abuse with per-IP throttling
7. **Multi-wallet support** — Save and select from multiple wallet addresses per token type
8. **Error retry with backoff** — Resilient API calls for production reliability (currently fail-fast)

---

## Tech Stack

- **Next.js 16** — App Router + API Routes
- **TypeScript** — Strict mode, zero compilation errors
- **Tailwind CSS v4** + **shadcn/ui** — Dark theme exchange UI
- **Meld White-Label API** — Sandbox environment
- **Vercel** — Deployment

---

Built by **Kam Mann** — [github.com/KaranMann28](https://github.com/KaranMann28)
