# Meld Crypto Exchange -- 20-Minute Presentation Script

> For Geotab Senior Solutions Engineer interview with Rafael.
> Live demo: https://meld-crypto-exchange.vercel.app
> GitHub: https://github.com/KaranMann28/meld-crypto-exchange

---

## SLIDE 1 -- Title (0:00 - 0:30)

> Hi Rafael, I'm Kam. Thanks for having me.
>
> I built a full-stack crypto exchange in about a week using a fintech API I had never touched before. I'm going to walk you through what it does, how I built it, what broke along the way, and what I learned. And I'll do a live demo of the actual deployed app.

---

## SLIDE 2 -- The Problem (0:30 - 2:00)

> So here's the problem. Let's say you want to buy $100 worth of Bitcoin.
>
> You could go to Coinbase, or Transak, or MoonPay, or a dozen other services. Each one charges different fees. Each one supports different countries. Each one accepts different payment methods -- Visa here, Apple Pay there, bank transfer only in Europe.
>
> So how do you know which one gives you the most Bitcoin for your hundred dollars?
>
> It's actually a lot like booking a flight. You don't go to American Airlines, then Delta, then United, then Southwest -- you go to Kayak. One search, every airline, best price.
>
> That's exactly the problem I solved, but for crypto.

---

## SLIDE 3 -- What Meld Does (2:00 - 3:30)

> The platform I built on top of is called Meld. Meld is essentially the Kayak of crypto.
>
> You make one API call with "I want to buy $200 of Ethereum in the United States with a credit card." Meld fans that request out to 50+ providers simultaneously and returns quotes from each one.
>
> But here's the interesting part -- they don't just sort by cheapest price. They use something called rampScore, which is a reliability rating. It predicts which provider will actually complete the transaction successfully, based on historical conversion rates, regional compatibility, and real-time provider health.
>
> Think of it this way: the cheapest flight doesn't help if the airline cancels half its routes. rampScore is about which provider actually delivers.

---

## SLIDE 4 -- What I Built (3:30 - 5:00)

> Given just API documentation and zero prior crypto experience, I built a complete exchange application. Users can:
>
> - Pick their country and currency
> - Choose which cryptocurrency they want to buy
> - Get live quotes from multiple providers ranked by that rampScore
> - See a full fee breakdown -- network fees, provider fees, partner fees -- totally transparent
> - Complete the purchase through the provider's payment flow
> - And track the transaction status via webhooks
>
> I also built the reverse flow -- you can sell crypto back to fiat currency using the same swap interface.
>
> The whole thing went from reading docs to deployed production app in under a week. Let me show you.

---

## SLIDE 5 -- LIVE DEMO (5:00 - 10:00)

> *[Switch to browser -- open https://meld-crypto-exchange.vercel.app]*
>
> So this is the live app, deployed on Vercel. Let me walk you through it.

**Step 1: The Interface**
> You'll notice it's a single-card exchange design -- inspired by apps like Uniswap and Phantom Wallet. Dark mode by default, but there's a light mode toggle up here. The animated background adds some visual depth without being distracting.
>
> Up in the corner you can see the green dot -- that's a live health check confirming the Meld sandbox API is connected and responding.

**Step 2: Amount Input**
> I'll type 200 here. Notice it validates the amount in real-time against Meld's purchase limits. If I try to type 5 -- *[type 5]* -- it would show me the minimum is $20.
>
> *[Change back to 200]*

**Step 3: Get Quotes**
> Now I'll hit Get Quotes.
>
> *[Click button, wait for quotes]*
>
> There we go -- two providers came back. You can see this one gives me slightly more Bitcoin than the other. Same $200, different amounts. The app ranks them by that rampScore I mentioned -- and it shows the percentage difference. So I can immediately see which provider gives me the best deal.
>
> Each card shows the fee breakdown: total fee, network fee, provider fee, partner fee. Full transparency.

**Step 4: Swap Direction**
> Now watch this -- *[click the swap arrow]*
>
> I just flipped from Buy to Sell mode. The button changes from purple to orange, the labels switch to "You sell" and "You receive," and if I get quotes here, it'll show me how much USD I'd get for selling a specific amount of Bitcoin.
>
> Same API, reversed direction. The code swaps source and destination currencies and changes the session type.

**Step 5: Settings**
> *[Click gear icon]*
>
> Behind this gear icon is the settings panel. Country selector with flag icons for 228 countries. Fiat currency -- 50 options. Payment methods with descriptions -- Card, Apple Pay, Google Pay, SEPA for Europe, PIX for Brazil.
>
> *[Close settings]*

**Step 6: Token Selector**
> *[Click crypto token button]*
>
> The token selector has a search bar and the sandbox-supported tokens pinned at the top with green badges. There are 200+ tokens here from the API, but only BTC, ETH, and USDC actually work in sandbox -- so I surfaced those first.
>
> *[Close selector]*

**Step 7: Quick Features**
> Two more things -- "Use test address" auto-fills a sandbox-safe wallet so testers don't have to find one. And down here, the chat widget has a built-in FAQ bot for common questions about fees, tokens, and the sandbox.

> Rafael, have you ever had to compare pricing across multiple vendors or providers for anything -- maybe SaaS tools, or even fleet hardware? That comparison experience is exactly what this does, just for crypto.

---

## SLIDE 6 -- How I Built It (10:00 - 13:00)

> Let me show you what's under the hood. Three layers.
>
> **Frontend** -- React with Next.js 16. Every component you just saw -- the exchange card, the token selector, the animated swap arrow, the settings dialog, the provider cards -- those are all custom React components. I used Framer Motion for the animations and shadcn/ui for the base design system.
>
> **Backend** -- 8 API routes that act as a proxy layer. Every call to Meld goes through my server, not the browser. This means the API key is never exposed to the client. Static data like countries and currencies is cached for a week -- that's actually Meld's own recommendation in their docs. But quotes are always fetched fresh because crypto prices change every second.
>
> **The Meld Client** -- This is a single TypeScript file called meld.ts. It wraps every HTTP call to Meld with proper authentication, API versioning headers, error handling, and retry logic. If Meld's server returns a 500, it waits one second and tries again before failing. If it returns a 401, it tells the user "Invalid API key" -- not just "something went wrong."
>
> I designed the whole thing so that if you handed this codebase to another developer, they could clone the repo, copy the environment template, and have it running in five minutes. That's not just code quality -- that's developer empathy. And for a Dev Support role, that matters.

---

## SLIDE 7 -- What Broke (13:00 - 16:00)

> Now, this wouldn't be an honest presentation if I only showed you what works. Let me tell you what broke.
>
> **First: the docs didn't match reality.** The Meld documentation shows example responses with field names like countryName and currencyName. But the actual API returns just name for both. And instead of networkCode and networkName, it's chainCode and chainName. I only discovered this by inspecting real API responses, not by reading the docs. Lesson: always verify against the live API.
>
> **Second: 200 tokens, only 3 work in sandbox.** The API returns every cryptocurrency Meld supports globally -- over 200 tokens. But the sandbox environment only supports Bitcoin, Ethereum, and USDC. So if a user selected Dogecoin, they'd get zero quotes and think the app was broken. I fixed this by pinning the sandbox tokens to the top of the list with a green "Sandbox" badge, so users naturally pick the ones that work.
>
> **Third: a subtle timing bug.** I built auto-quoting -- when you type an amount, it waits 800 milliseconds after you stop typing and then fetches quotes automatically. But there was a bug: the debounce function was capturing an old validation state because of how JavaScript closures work. The amount would be valid, but the closure was still seeing the error from the previous keystroke. I fixed it by returning the validation result as a boolean at the moment of capture, instead of reading state inside the delayed function.
>
> Every one of these bugs taught me something I couldn't have learned from a tutorial. Debugging against a real API, with real data, in a real integration -- that's where understanding happens.

---

## SLIDE 8 -- What I'd Improve (16:00 - 18:00)

> If I had more time, here's what I'd add:
>
> **Persistent storage.** Right now, webhook events from Meld are stored in memory. If the server restarts, that data is gone. In production, I'd use a database.
>
> **Webhook signature verification.** I scaffolded the function and left a reference to Meld's authentication docs, but I didn't implement the full HMAC validation. In production, you need to verify that incoming webhooks actually came from Meld and weren't spoofed.
>
> **Real-time updates.** Instead of the user manually looking up a transaction ID, WebSockets could push status changes to the browser the moment they happen.
>
> I think the ability to identify what you'd do differently is just as important as what you shipped. It shows you're thinking beyond the demo and toward production.

---

## SLIDE 9 -- Key Takeaways (18:00 - 19:30)

> Three takeaways from this project:
>
> **One: Aggregation beats single-provider.** One integration, global coverage. This pattern isn't unique to crypto -- it applies anywhere you're connecting multiple data sources or service providers through a single API.
>
> **Two: Scoring turns raw data into decisions.** rampScore takes complex multi-factor data and outputs a simple ranking that any user can act on. They don't need to understand the algorithm -- they just pick the top result. That's powerful product design.
>
> **Three: The best integrations are invisible.** The user sees a clean exchange. They don't see 8 API routes, a caching layer, retry logic, or webhook handlers running behind it. And that's the point. Good infrastructure disappears.

---

## SLIDE 10 -- Close (19:30 - 20:00)

> That's the Meld Crypto Exchange. I went from zero crypto experience to a deployed, production-aware integration in under a week.
>
> The app is live at meld-crypto-exchange.vercel.app, and the code is on GitHub if you'd like to look through it.
>
> I'd love to hear your thoughts and answer any questions.

---

## Delivery Notes

- **Pace:** ~130 words per minute. Practice the demo section especially -- it's the longest and most improvised part.
- **Eye contact:** Look at camera, not at the app during demo. Glance at the app to click, then look back.
- **If the demo breaks:** "This is sandbox -- it does this sometimes. Let me show you the code instead." Switch to GitHub README.
- **If you're running long:** Cut Slide 8 (Improvements) down to one sentence: "I documented three improvements in the README -- persistent storage, webhook verification, and real-time push."
- **If you're running short:** Expand the demo. Show the transaction tracker page. Show the health endpoint in a new tab.
