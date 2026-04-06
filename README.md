# Meld Crypto Exchange — White-Label API Integration

A full-stack crypto on-ramp integration built with **Next.js 16**, **TypeScript**, and **Meld's White-Label API**. Users can compare real-time quotes from multiple crypto providers, select the best rate, and complete a purchase — all through a single interface.

Meld's core value is **aggregation over a single provider**. A team integrating MoonPay gets one provider with one set of countries, fees, and payment methods. Integrating Transak gets another set. Integrating both doubles the work and requires custom routing logic. Meld solves this: one API, 50+ providers, 180+ countries, 150+ fiat currencies, 54 local payment methods. The `rampScore` algorithm ranks quotes not just by price, but by conversion likelihood — factoring in regional success rates, payment method compatibility, and real-time provider health. This integration demonstrates that pattern end-to-end.

**Live Demo:** [meld-crypto-exchange.vercel.app](https://meld-crypto-exchange.vercel.app)

---

## Key Concepts (for non-crypto readers)

| Term | What It Means |
|------|--------------|
| **On-ramp** | Converting fiat money (USD, EUR) into cryptocurrency. The user pays with a credit card or bank transfer and receives BTC, ETH, etc. in their wallet. |
| **Off-ramp** | The reverse — converting crypto back to fiat and withdrawing to a bank account. |
| **KYC** | "Know Your Customer" — identity verification required by regulations before a user can buy/sell crypto. Each provider handles this differently. |
| **Stablecoin** | A cryptocurrency pegged to a fiat currency (e.g., USDC = $1 USD). Used for payments, remittances, and DeFi. |
| **rampScore** | Meld's proprietary scoring algorithm that ranks providers by conversion likelihood — factoring in historical success rates, regional compatibility, payment method fit, and real-time provider performance. Higher score = higher chance the user completes the purchase. |
| **Wallet address** | A public blockchain address where purchased crypto is delivered. Like a bank account number, but for crypto. |

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
│   Frontend       │   Backend (8 API Routes)           │
│                  │                                    │
│   /              │   /api/countries      GET           │
│   (Exchange UI)  │   /api/currencies     GET           │
│   Buy + Sell     │   /api/quote          POST          │
│                  │   /api/session         POST          │
│   /transactions  │   /api/transaction/[id] GET          │
│   (TX Tracker)   │   /api/transactions    GET           │
│   /demo /slides  │   /api/webhook         POST          │
│                  │   /api/health          GET           │
│                  │   /api/chat            GET + POST     │
├──────────────────┴───────────────────────────────────┤
│   /lib/meld.ts — API client, TTL cache, retry, errors │
│   /lib/logger.ts — Structured request logging          │
│   /lib/transaction-store.ts — In-memory TX + webhooks  │
│   /lib/types.ts — TypeScript interfaces                │
│   /lib/crypto-icons.ts — Token/provider/payment icons  │
└──────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **API keys never touch the browser.** All Meld calls proxy through Next.js API routes (`MELD_API_KEY` server-only). Optional **Gemini** support chat uses `GEMINI_API_KEY` only in `/api/chat` — the client calls your app, not Google directly. See [SECURITY.md](./SECURITY.md).
- **Static data is cached server-side.** Countries, currencies, payment methods, and limits are cached with a 7-day TTL (per Meld's own recommendation in the "API Response Caching Guide").
- **Quotes are never cached.** Always fetched fresh — crypto prices move every second.
- **Quotes ranked by `rampScore`.** Meld's conversion-likelihood algorithm. Secondary sort: highest `destinationAmount` (most crypto for the user's money).
- **Webhook idempotency.** Incoming events are deduplicated by `eventId` before processing, as Meld's docs recommend.
- **Specific error messages.** HTTP 401, 403, 429, and 5xx from Meld are mapped to human-readable messages rather than generic "something went wrong."
- **API versioning.** Every request includes the `Meld-Version: 2026-02-03` header. Meld's docs note that non-breaking changes (new fields) ship without versioning, while breaking changes are versioned. The API client uses flexible parsing to handle unexpected fields gracefully.
- **Wallet address forwarded to quote request.** When available, the user's wallet is included in the quote for more accurate pricing from providers that factor it in.
- **Retry on 5xx.** `meldFetch` retries once with a 1-second delay on server errors before failing — production-grade resilience without complexity.
- **Structured logging.** Every API route logs `[timestamp][LEVEL][route] method status latencyMs — detail` via `src/lib/logger.ts` for consistent observability.
- **Session validation.** The `/api/session` route validates all 7 required fields and returns specific missing field names — not cryptic Meld errors.
- **Webhook security placeholder.** `verifyWebhookSignature()` is scaffolded with a reference to [Meld's webhook auth docs](https://docs.meld.io/docs/webhooks-authentication) for production HMAC verification.
- **Support chat.** `POST /api/chat` sends prompts to Gemini with a sandbox-focused system prompt; `GET /api/chat` returns `{ aiEnabled }` without exposing secrets. Per-IP rate limiting and a body size cap reduce abuse (see `src/lib/rate-limit.ts`).

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

# Optional — AI support widget (server-only; never NEXT_PUBLIC_)
GEMINI_API_KEY=
# GEMINI_MODEL=gemini-2.5-flash
```

Security checklist: [SECURITY.md](./SECURITY.md)

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
- **Buy + Sell flows.** Buy (on-ramp) is fully testable end-to-end in sandbox. Sell (off-ramp) returns real quotes but full transactions require production. The UI supports both via the swap arrow toggle.

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

**6. React `useRef` strict mode typing in Next.js 16.**
`useRef<ReturnType<typeof setTimeout>>()` without an initial value fails TypeScript strict mode because the generic expects exactly 1 argument. The fix was `useRef<ReturnType<typeof setTimeout> | null>(null)` — a subtle difference that only surfaces with `strict: true` in `tsconfig.json`.

**7. Debounce closure capturing stale state.**
The auto-quote debounce initially checked `amountError` inside the `setTimeout` callback, but closures capture the variable's value at creation time, not execution time. If the user typed a valid amount after an invalid one, the debounce would still see the old error. Fixed by having `validateAmount()` return a boolean and passing that directly into the closure instead of reading state.

---

## Improvements I'd Make

1. **Persistent transaction store** — Vercel KV or Postgres for durable webhook event storage across deployments
2. **WebSocket push** — Stream transaction status changes to the frontend in real-time instead of manual lookup
3. **Full sell flow (off-ramp)** — Sell quotes are implemented; complete off-ramp transactions once sandbox supports them
4. **Transfer flow** — Support exchange-to-wallet transfers using Meld's transfer API
5. **Quote auto-refresh timer** — Visual countdown + auto-refetch every 30s since crypto prices are volatile
6. **Webhook signature verification** — Validate incoming webhook authenticity using [Meld's HMAC signing](https://docs.meld.io/docs/webhooks-authentication)
7. **Extend rate limiting** — Chat is throttled in-process; extend to Vercel KV / Redis for all routes at scale
8. **Multi-wallet support** — Save and select from multiple wallet addresses per token type, validated by chain
9. **Error retry with exponential backoff** — Resilient API calls with jitter for production reliability
10. **Ramp Intelligence deep integration** — Leverage Meld's [conversion routing](https://docs.meld.io/docs/ramp-intelligence) API to pre-filter providers by `lowKyc` thresholds, reducing friction for small purchases
11. **Multi-downstream app support** — Meld supports [multiple downstream applications](https://docs.meld.io/docs/supporting-multiple-downstream-applications) per account — could expose app-level configuration in the UI

---

## Tech Stack

- **Next.js 16** — App Router + API Routes
- **TypeScript** — Strict mode, zero compilation errors
- **Tailwind CSS v4** + **shadcn/ui** — Dark theme exchange UI
- **Meld White-Label API** — Sandbox environment
- **Vercel** — Deployment

---

Built by **Kam Mann** — [github.com/KaranMann28](https://github.com/KaranMann28)
