# Meld Crypto Exchange — White-Label API Integration

A full-stack crypto on-ramp integration built with **Next.js 16**, **TypeScript**, and **Meld's White-Label API**. Users can compare real-time quotes from multiple crypto providers, select the best rate, and complete a purchase — all through a single interface.

**Live Demo:** _[Deployed on Vercel — link TBD after deployment]_

---

## What It Does

This app implements Meld's 7-step White-Label API flow:

1. **Country Detection** — Auto-loads supported countries with flag icons
2. **Currency Defaults** — Sets fiat currency and payment method based on country
3. **Crypto Selection** — Displays available tokens with icons from Meld CDN
4. **Amount Validation** — Input with real-time validation against provider limits
5. **Quote Comparison** — Fetches live quotes from multiple providers, ranked by Meld's `rampScore` (conversion likelihood)
6. **Provider Launch** — Creates a widget session and opens the provider's KYC/payment UI
7. **Transaction Tracking** — Webhook endpoint receives status updates (PENDING → SETTLING → SETTLED)

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
│   /lib/meld.ts — API client (BASIC auth, all endpoints) │
│   /lib/types.ts — TypeScript interfaces                │
│   /lib/transaction-store.ts — In-memory TX cache       │
│   /lib/crypto-icons.ts — Token icon + provider helpers │
└──────────────────────────────────────────────────────┘
```

**Key design decisions:**

- **API key never touches the browser** — All Meld API calls go through Next.js API routes
- **Static data cacheable** — Countries, currencies, payment methods rarely change (Meld recommends 1-week cache)
- **Quotes are never cached** — Always fetched fresh for accurate pricing
- **Quotes ranked by `rampScore`** — Meld's conversion-likelihood score, with `destinationAmount` as tiebreaker
- **Webhook-ready** — `/api/webhook` endpoint receives Meld events and stores them in-memory for demo purposes

---

## Setup & Run

### Prerequisites

- Node.js 20+ and npm
- A Meld API key (sandbox)

### Install & Run

```bash
git clone https://github.com/KaranMann28/meld-crypto-exchange.git
cd meld-crypto-exchange
npm install
```

Create `.env.local`:

```env
MELD_API_KEY=your_meld_sandbox_api_key
MELD_API_BASE_URL=https://api-sb.meld.io
MELD_API_VERSION=2026-02-03
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test a Purchase Flow

1. Select country (US) and crypto (BTC or ETH)
2. Enter amount (e.g., $100)
3. Click **Get Quotes** — you'll see quotes from sandbox providers
4. Enter a test wallet address (e.g., `0xd72cc3468979360e31bc83b84f0887deccfd81d5` for ETH)
5. Click **Buy with [Provider]** — the provider's sandbox widget opens in a popup
6. Use test card: `4111 1111 1111 1111`, expiry `10/33`, CVV `123`

---

## Assumptions

- **Sandbox only** — All API calls target `api-sb.meld.io`. Sandbox has limited tokens (BTC, ETH, USDC) and providers
- **In-memory transaction store** — Webhook events are stored in-memory for demo. In production, this would use a database
- **No user authentication** — This is a demo integration; a production app would have user accounts and session management
- **Buy flow only** — Sell (off-ramp) is quote-only in sandbox; transfer is configuration-only

---

## Challenges Faced

1. **API response shape inconsistencies** — The Meld docs show example responses with field names like `countryName` and `currencyName`, but the actual API returns `name` for both. Similarly, `networkCode`/`networkName` are actually `chainCode`/`chainName`. Required defensive coding and runtime discovery.

2. **Sandbox provider availability** — Not all providers have sandbox environments. Robinhood, Coinbase Pay, and Blockchain.com are production-only. Had to identify which providers actually work in sandbox (Transak, Unlimit, TransFi, Simplex, Sardine).

3. **Webhook testing locally** — Meld webhooks require a publicly accessible URL. For local development, tools like ngrok or webhook.site are needed. On Vercel, the API route is public by default, solving this for production.

4. **Quote response variations** — Some providers return `null` for optional fields (`networkFee`, `partnerFee`). The UI needs null-safe rendering throughout.

---

## Improvements I'd Suggest

1. **Persistent transaction storage** — Replace in-memory store with Vercel KV or a database for production durability
2. **WebSocket real-time updates** — Push transaction status changes to the frontend via WebSockets instead of polling
3. **Sell flow (off-ramp)** — Add the reverse flow (crypto → fiat) once sandbox supports full transactions
4. **Rate refresh timer** — Auto-refresh quotes every 30 seconds since crypto prices change rapidly
5. **Fee comparison visualization** — Chart view comparing provider fees side-by-side
6. **Webhook signature verification** — Validate webhook authenticity using Meld's webhook authentication
7. **Multi-wallet support** — Let users save and select from multiple wallet addresses
8. **Error retry with exponential backoff** — More resilient API calls for production reliability

---

## Tech Stack

- **Next.js 16** (App Router, API Routes)
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Meld White-Label API** (Sandbox)
- **Vercel** (Deployment)

---

Built by **Kam Mann** — [github.com/KaranMann28](https://github.com/KaranMann28)
