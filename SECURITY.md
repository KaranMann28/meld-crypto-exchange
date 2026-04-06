# Security notes

## Secrets and environment variables

| Variable | Where it runs | Never |
|----------|----------------|-------|
| `MELD_API_KEY` | Server only (API routes, `meld.ts`) | Browser, `NEXT_PUBLIC_*`, Git, screenshots |
| `GEMINI_API_KEY` | Server only (`/api/chat`) | Client bundle, committed files, chat logs you paste into email |
| `NEXT_PUBLIC_APP_URL` | Build/runtime (public) | OK to be public — URLs only |

- Copy [`.env.example`](.env.example) to **`.env.local`** and put real keys there. `.env*.local` is gitignored.
- In Vercel: add the same variables under **Project → Settings → Environment Variables** (Production + Preview as needed). Do not commit `.env.local`.

## If a key is exposed

1. **Revoke or rotate** the key in the provider console (Meld dashboard, Google AI Studio / Cloud).
2. Replace the value in `.env.local` and Vercel only.
3. If the key was committed, remove it from **git history** (e.g. `git filter-repo` or BFG) and treat the key as burned.

## Chat endpoint (`/api/chat`)

- The Gemini key is read only on the server; the browser calls your Next.js route, not Google directly.
- **GET `/api/chat`** returns only `{ aiEnabled: boolean }` so the UI can show whether AI is configured — it never returns the key.
- **POST `/api/chat`** applies per-IP rate limiting and a maximum body size to reduce abuse. For high traffic, move limits to Redis / Vercel KV and add auth if needed.

## Meld integration

- All Meld HTTP calls go through Next.js API routes; the White-Label key is not sent to the client.
- Webhooks: implement HMAC verification in production per [Meld webhook authentication](https://docs.meld.io/docs/webhooks-authentication) (scaffolded in this repo).

## Dependency and supply chain

- Run `npm audit` periodically and keep Next.js patched.
- Do not install packages that exfiltrate env vars; prefer well-known SDKs (`@google/generative-ai` from Google).
