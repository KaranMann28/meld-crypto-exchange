# Meld Crypto Exchange -- 20-Minute Presentation Script

> Coordinated with the slide deck at meld-crypto-exchange.vercel.app/slides
> Live demo: https://meld-crypto-exchange.vercel.app
> GitHub: https://github.com/KaranMann28/meld-crypto-exchange
>
> **Rafael is evaluating:** Technical Translation, Rapport Building, Clarity
> **Mindset:** Make crypto feel as natural as booking a flight. Never lecture -- converse.

---

## SLIDE 1 -- Title (0:00 - 0:30)

**On screen:** "Meld Crypto Exchange" + subtitle + your name

> Hi Rafael, thanks for having me. I'm Kam.
>
> I'm going to walk you through a project where I took a fintech API I'd never seen before and built a full crypto exchange from scratch -- in about a week. I'll show you what it does, do a live demo of the deployed app, and then talk about what broke and what I learned.

**[Technical Translation]** Set the frame immediately: this is a "learn fast, ship fast" story, not a crypto lecture.
**[Rapport]** Use his name once. Warm, confident tone. No filler words.

---

## SLIDE 2 -- The Problem (0:30 - 2:00)

**On screen:** "Buying crypto is fragmented" + 3 bullets + Kayak callout

> So here's the problem I was solving.
>
> Let's say you want to buy $100 worth of Bitcoin. You could go to Coinbase. Or Transak. Or MoonPay. Or a dozen other services. Each one charges different fees, supports different countries, accepts different payment methods.
>
> So how do you know which one gives you the most Bitcoin for your hundred dollars?
>
> *[pause -- let the question land]*
>
> It's actually a lot like booking a flight. You don't go to American Airlines, then Delta, then United, then Southwest one by one. You go to Kayak. One search, every airline, best price.
>
> That's the problem I solved -- but for crypto.

**[Technical Translation]** The Kayak analogy is the anchor. If Rafael remembers one thing, it's this.
**[Rapport]** The pause after the question invites Rafael to think "yeah, that would be annoying." That's engagement.

---

## SLIDE 3 -- What Meld Does (2:00 - 3:30)

**On screen:** "Meld = Kayak for crypto" + 3 bullets + reliability callout

> The platform I built on top of is called Meld. Meld is essentially the Kayak of crypto.
>
> You make one API call -- "I want to buy $200 of Ethereum in the US with a credit card" -- and Meld sends that to 50+ providers at once and brings back quotes from each one.
>
> But here's the clever part. They don't just sort by cheapest price. They use something called rampScore -- think of it as a reliability rating. It predicts which provider will actually complete the transaction, based on track record, regional compatibility, and real-time health.
>
> *[look at Rafael]* Because the cheapest flight means nothing if the airline cancels half its routes, right?

**[Technical Translation]** rampScore = "reliability rating." Three words. Done.
**[Rapport]** End with a rhetorical question that invites a nod or smile.

---

## SLIDE 4 -- What I Built (3:30 - 5:00)

**On screen:** "Full exchange in < 1 week" + 5 bullets

> So given just the API documentation and zero prior crypto experience, here's what I built.
>
> A complete exchange where users can pick their country, choose a cryptocurrency, get live quotes from multiple providers ranked by that reliability score, see a full fee breakdown -- and complete a purchase.
>
> I also built the reverse. You can sell crypto back to regular currency using the same interface -- there's a swap button that flips the direction.
>
> The whole thing went from reading docs to a live, deployed app in under a week.
>
> Let me show you.

**[Technical Translation]** "Regular currency" instead of "fiat." Keep it human.
**[Rapport]** "Let me show you" creates anticipation. Transition naturally to the demo.

---

## SLIDE 5 -- Live Demo (5:00 - 10:00)

**On screen:** "meld-crypto-exchange.vercel.app" + demo steps

> *[Switch to browser tab with the live app open. Have it pre-loaded.]*

**Step 1 -- The Interface (30 sec)**
> So this is the live app. It's deployed on Vercel -- this isn't localhost, it's production.
>
> You'll notice it's a single-card design -- inspired by apps like Uniswap, which is the most popular crypto exchange. Dark mode by default, but there's a light mode toggle up here.
>
> And see that green dot? That's a live health check -- it's confirming the Meld API is connected right now.

**Step 2 -- Amount + Validation (30 sec)**
> I'll type 200. Notice it accepted that -- but if I type 5... *[type 5]* ...it tells me the minimum is $20. That's validating against Meld's actual purchase limits in real-time.
>
> *[Change back to 200]*

**Step 3 -- Get Quotes (60 sec)**
> Now I'll hit Get Quotes.
>
> *[Click, wait for results]*
>
> Two providers came back. This one gives me slightly more Bitcoin than that one -- same $200, different amounts. And the app shows me the percentage difference automatically, so I can see at a glance which is the better deal.
>
> Each card breaks down the fees: total fee, network fee, provider fee, partner fee. Full transparency. No hidden costs.

**Step 4 -- Swap Arrow (30 sec)**
> Now watch this. *[click the swap arrow]*
>
> I just flipped from Buy to Sell. The button changes color, the labels switch, and now I can type how much Bitcoin I want to sell and see how much cash I'd get back.
>
> Same API, reversed direction. One line of code changes the transaction type.

**Step 5 -- Settings (30 sec)**
> *[click gear icon]*
>
> Behind this gear icon -- country selector with flags for 228 countries. Fifty fiat currencies. Payment methods with icons and descriptions -- Card, Apple Pay, Google Pay, bank transfers for different regions.

**Step 6 -- Token Selector + Features (30 sec)**
> *[click token button]*
>
> Token selector with search. The green badges mark which tokens work in sandbox mode. And down here -- *[point to wallet field]* -- "Use test address" auto-fills a safe wallet for testing.

**Rapport Moment (30 sec)**
> *[Look at Rafael]*
>
> Rafael, have you ever had to compare pricing across multiple vendors for anything? Maybe SaaS tools, or hardware quotes, or even insurance?
>
> *[Let him answer briefly]*
>
> That comparison experience is exactly what this does. Just applied to crypto providers instead.

**[Technical Translation]** Every feature is shown through what it does for the user, not how it works technically.
**[Rapport]** Asking Rafael a real question makes this a conversation, not a presentation. The Docebo panel praised this exact technique.

---

## SLIDE 6 -- How I Built It (10:00 - 13:00)

**On screen:** Three-column card layout: Frontend / Backend / Meld Client

> *[Switch back to slides]*
>
> Under the hood, three layers.
>
> **Frontend** -- React with Next.js. Every component you just saw is custom -- the exchange card, the token selector, the animated swap arrow, the provider cards. Twelve components total. I used Framer Motion for the animations.
>
> **Backend** -- Eight API routes that act as a proxy. Every call to Meld goes through my server, not the browser. That means the API key is never exposed. Static data like countries and currencies is cached for a week -- that's actually Meld's own recommendation. But quotes are always fresh because prices change every second.
>
> **The Meld Client** -- This is a single file that wraps all the HTTP calls with authentication, error handling, and retry logic. If Meld's server is down, it waits a second and tries again. If the API key is wrong, it tells the user "Invalid API key" -- not "something went wrong."
>
> *[pause]*
>
> I designed it so that another developer could clone the repo, copy the environment template, and have it running in five minutes. That's not just clean code -- that's empathy for the next person who touches it.

**[Technical Translation]** "Proxy" = "goes through my server." "Cache" = "saved for a week." "Retry" = "waits and tries again." Every technical term is immediately followed by plain English.
**[Rapport]** "Empathy for the next person" -- this signals SE mindset, not just developer skill.

---

## SLIDE 7 -- What Broke (13:00 - 16:00)

**On screen:** Three problem->fix cards with red->green format

> This wouldn't be honest if I only showed you what works. Let me tell you what broke.
>
> **First.** The documentation showed field names like "countryName." The actual API returned just "name." Same data, different label. I only caught this by looking at real responses, not by trusting the docs. Lesson: always verify against the live system.
>
> **Second.** The API returned over 200 cryptocurrency tokens. But the sandbox only supports three -- Bitcoin, Ethereum, and USDC. So if someone picked Dogecoin, they'd get zero results and think the app was broken. I fixed it by pinning the working tokens to the top with a green badge.
>
> **Third.** I built auto-quoting -- type an amount, and quotes refresh automatically after you stop typing. But there was a subtle timing bug. The function was looking at an error state from 800 milliseconds ago because of how JavaScript handles delayed execution. The value had already changed, but the function was still seeing the old one. I fixed it by capturing the result at the right moment instead of reading it later.
>
> *[pause]*
>
> Every one of these taught me something I couldn't learn from a tutorial. Debugging against a real API, with real data -- that's where real understanding happens.

**[Technical Translation]** The closure bug is explained without saying "closure." "Delayed execution" + "seeing the old value" is enough. Rafael doesn't need the CS term -- he needs to understand the concept.
**[Rapport]** Vulnerability builds trust. Showing what broke proves you're not performing -- you're sharing real experience.

---

## SLIDE 8 -- What I'd Improve (16:00 - 18:00)

**On screen:** Three improvement bullets + callout

> If I had more time, three things:
>
> **One** -- right now, transaction data lives in memory. If the server restarts, it's gone. In production, that needs a database.
>
> **Two** -- I built the function for verifying incoming webhook messages, but I didn't implement the full cryptographic check. In production, you need to confirm those messages actually came from Meld.
>
> **Three** -- instead of the user manually looking up a transaction, the app should push updates in real-time the moment something changes.
>
> I think the ability to identify what you'd do differently is just as important as what you shipped. It shows you're thinking beyond the demo.

**[Technical Translation]** "Cryptographic check" instead of "HMAC validation." "Push updates in real-time" instead of "WebSocket integration."
**[Rapport]** The closing line is a values statement. Rafael will remember it.

---

## SLIDE 9 -- Key Takeaways (18:00 - 19:30)

**On screen:** Three numbered takeaways with detail text

> Three takeaways:
>
> **One -- Aggregation beats single-provider.** One integration, global coverage. This isn't just a crypto pattern -- it applies anywhere you're connecting multiple data sources through a single platform.
>
> **Two -- Scoring turns raw data into decisions.** rampScore takes complex signals and outputs a simple ranking anyone can act on. Users don't need to understand the algorithm. They just pick the top result.
>
> **Three -- The best integrations are invisible.** The user sees a clean exchange. They don't see eight API routes, a caching layer, retry logic, or webhook handlers. That's the point. Good infrastructure disappears.

**[Technical Translation]** Each takeaway is deliberately universal, not crypto-specific. Rafael should leave thinking "this person can translate anything."
**[Rapport]** Speak these slowly. Let each one land before moving to the next.

---

## SLIDE 10 -- Close (19:30 - 20:00)

**On screen:** "Questions?" + links + your name

> That's the Meld Crypto Exchange. I went from zero crypto experience to a deployed, production-aware application in under a week.
>
> The app is live -- I'll drop the link in the chat. The code is on GitHub if you'd like to look through it.
>
> I'd love to hear your thoughts and answer any questions.

**[Rapport]** Smile. Don't rush the ending. Let silence be comfortable.

---

## Delivery Cheat Sheet

| If this happens... | Do this... |
|---|---|
| Demo won't load | "This is sandbox -- let me show you the architecture slide instead." Switch to slide 6. |
| Running long at 15 min | Cut Slide 8 to one sentence: "I documented three improvements in the README." |
| Running short at 17 min | Expand demo: show Transactions page, show /api/health in a new tab. |
| Rafael asks a question mid-slide | Answer it. Don't say "I'll get to that." Flexibility > structure. |
| Awkward silence after your answer | That's fine. Don't fill it. Smile and wait. |
| You don't know the answer | "Great question. I'd rather give you an accurate answer than guess -- can I follow up?" |

## Timing Summary

| Slide | Topic | Duration | Cumulative |
|-------|-------|----------|------------|
| 1 | Title | 0:30 | 0:30 |
| 2 | Problem | 1:30 | 2:00 |
| 3 | Meld Solution | 1:30 | 3:30 |
| 4 | What I Built | 1:30 | 5:00 |
| 5 | **LIVE DEMO** | **5:00** | **10:00** |
| 6 | Architecture | 3:00 | 13:00 |
| 7 | What Broke | 3:00 | 16:00 |
| 8 | Improvements | 2:00 | 18:00 |
| 9 | Takeaways | 1:30 | 19:30 |
| 10 | Close | 0:30 | 20:00 |
