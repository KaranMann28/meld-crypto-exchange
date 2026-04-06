# Meld Crypto Exchange -- 20-Minute Presentation Script

> Coordinated with the slide deck at meld-crypto-exchange.vercel.app/slides
> Live demo: https://meld-crypto-exchange.vercel.app
> GitHub: https://github.com/KaranMann28/meld-crypto-exchange
>
> **Rafael is evaluating:** Technical Translation, Rapport Building, **Clarity**
> **Clarity rule:** At any point, Rafael should know (1) where you are, (2) where you're going, (3) why this section matters.

---

## SLIDE 1 -- Title + Roadmap (0:00 - 0:30)

**On screen:** "Meld Crypto Exchange" + subtitle + your name

> Hi Rafael, thanks for having me. I'm Kam.
>
> I'm going to walk you through a project where I took a fintech API I'd never seen before and built a full crypto exchange from scratch in about a week.
>
> I'll cover **four things**: the problem I solved, a live demo of the app, how I built it technically, and what I learned along the way. Should take about twenty minutes, then I'm all yours for questions.

**[Clarity]** The roadmap sentence gives Rafael a mental map of the entire presentation. He now knows the shape of the next 20 minutes: Problem, Demo, Build, Learnings. This is the single most important structural move.

---

## SLIDE 2 -- The Problem (0:30 - 2:00)

**On screen:** "Buying crypto is fragmented" + 3 bullets + Kayak callout

> So, **starting with the problem.**
>
> Let's say you want to buy $100 worth of Bitcoin. You could go to Coinbase. Or Transak. Or MoonPay. Or a dozen other services. Each one charges different fees, supports different countries, accepts different payment methods.
>
> So how do you know which one gives you the most Bitcoin for your hundred dollars?
>
> *[pause]*
>
> It's a lot like booking a flight. You don't go to American Airlines, then Delta, then United, then Southwest one by one. You go to Kayak. One search, every airline, best price.
>
> That's the problem I solved -- but for crypto.

**[Clarity]** "Starting with the problem" signals to Rafael: we're in section 1 of 4.
**[Rapport]** The pause after the question invites him to think "yeah, that would be annoying."

---

## SLIDE 3 -- What Meld Does (2:00 - 3:30)

**On screen:** "Meld = Kayak for crypto" + 3 bullets + reliability callout

> **The platform I built on top of is called Meld.** Meld is the Kayak of crypto.
>
> You make one API call -- "I want to buy $200 of Ethereum in the US with a credit card" -- and Meld sends that to 50+ providers at once and brings back quotes from each one.
>
> But they don't just sort by cheapest price. They use something called rampScore -- think of it as a **reliability rating**. It predicts which provider will actually complete the transaction, based on track record, regional compatibility, and real-time health.
>
> Because the cheapest flight means nothing if the airline cancels half its routes, right?

**[Clarity]** rampScore is introduced with an immediate plain-English synonym ("reliability rating") so Rafael never needs to memorize a term.

---

## SLIDE 4 -- What I Built (3:30 - 5:00)

**On screen:** "Full exchange in < 1 week" + 5 bullets

> **So that's the problem and the platform. Now -- what did I actually build?**
>
> Given just the API documentation and zero crypto experience, I built a complete exchange. Users can:
> - Pick their country and currency
> - Choose which cryptocurrency to buy
> - Get live quotes from multiple providers, ranked by that reliability score
> - See a full fee breakdown -- totally transparent
> - And complete the purchase
>
> I also built the reverse direction -- sell crypto back to regular currency using the same swap interface.
>
> The whole thing went from reading docs to a deployed app in under a week.
>
> **Let me show you the live app.**

**[Clarity]** "That's the problem and the platform. Now -- what did I actually build?" is a structural bridge. Rafael knows we're transitioning from context to output.
**[Clarity]** "Let me show you the live app" signals the demo is starting.

---

## SLIDE 5 -- Live Demo (5:00 - 10:00)

**On screen:** "meld-crypto-exchange.vercel.app" + demo steps

> *[Switch to browser tab with the live app pre-loaded]*
>
> **This is the live app.** It's deployed -- not localhost. Let me walk through the key features.

**Feature 1 -- The Interface (30 sec)**
> You'll notice it's a single-card design, inspired by the top crypto exchanges. Dark mode by default, light mode toggle up here. And see that green dot? That's a live health check confirming the API is connected right now.

**Feature 2 -- Amount Input (30 sec)**
> I'll type 200. It accepted that. But watch if I type 5... *[type 5]* ...it tells me the minimum is $20. That's validating against Meld's actual purchase limits.
>
> *[Change back to 200]*

**Feature 3 -- Quote Comparison (60 sec)**
> Now -- **the core feature.** I'll hit Get Quotes.
>
> *[Click, wait]*
>
> Two providers came back. This one gives me slightly more Bitcoin than that one. Same $200, different amounts. The app shows the percentage difference automatically.
>
> And each card breaks down the fees: total, network, provider, partner. **Full transparency.**

**Feature 4 -- Buy/Sell Toggle (30 sec)**
> Now watch this. *[click the swap arrow]*
>
> I just flipped from Buy to Sell. The button changes color, labels switch. Now I can see how much cash I'd get for selling Bitcoin. Same API, reversed direction.

**Feature 5 -- Configuration (30 sec)**
> *[click gear icon]*
>
> Settings: 228 countries with flags, 50 currencies, payment methods with descriptions -- Card, Apple Pay, Google Pay, regional options.

**Feature 6 -- Token Selection (30 sec)**
> *[click token button]*
>
> Token selector with search. Green badges mark what works in sandbox. And "Use test address" auto-fills a wallet so testers don't have to find one.

**Feature 7 -- Support Chat + Security (45 sec)**
> *[Open the floating chat]*
>
> This is a real support-style chat. If I've configured a Gemini key **only on the server**, answers come from the model. The browser never sees that key — same pattern as Meld: proxy through Next.js. There's rate limiting so one IP can't burn my API quota in a demo.
>
> If the key isn't set, it degrades gracefully to a built-in FAQ so the demo never breaks.

**Feature 8 -- Presenter Tools (20 sec)**
> I added a **`/demo`** page — an ordered checklist so I'm not improvising which tab to open. **`/slides`** is the full deck if we want to jump back. **`/api/health`** is a raw JSON health check you can open in a tab to prove the sandbox is live.

**Rapport Moment (30 sec)**
> *[Look at Rafael]*
>
> Rafael, have you ever compared pricing across multiple vendors for anything? SaaS tools, hardware, insurance?
>
> *[Let him answer]*
>
> That comparison experience is exactly what this does -- just for crypto providers.

**[Clarity]** Each demo feature is numbered and named ("Feature 1 -- The Interface"). This prevents the demo from feeling like aimless clicking. Rafael knows: there are 8 features, we're on number 3.
**[Clarity]** "Now -- the core feature" flags the most important moment in the demo.

---

## SLIDE 6 -- How I Built It (10:00 - 13:00)

**On screen:** Three-column card layout: Frontend / Backend / Meld Client

> *[Switch back to slides]*
>
> **That was the what. Now the how.** Three layers.
>
> **First -- Frontend.** React with Next.js. Twelve custom components: the exchange card, token selector, swap arrow, provider cards, settings dialog. Framer Motion for the animations.
>
> **Second -- Backend.** Nine API routes: eight for Meld, plus one for the support chat. Both the Meld key and the optional Gemini key stay on the server -- never in the browser, never as `NEXT_PUBLIC`. Static data is cached for a week, which is Meld's own recommendation. Quotes are always fresh because prices change every second. Chat has basic rate limits and a body size cap so it's harder to abuse in a public demo.
>
> **Third -- the Meld Client.** A single file that wraps all HTTP calls with authentication, error handling, and retry logic. If Meld's server goes down, it waits a second and tries again. If the API key is wrong, it tells the user specifically -- not "something went wrong."
>
> *[pause]*
>
> I designed it so another developer could clone the repo and have it running in five minutes. That's developer empathy -- which matters a lot in a support-facing role.

**[Clarity]** "That was the what. Now the how." is the structural bridge. Rafael knows we've shifted from demo to architecture.
**[Clarity]** "First, Second, Third" numbering makes the architecture scannable.

---

## SLIDE 7 -- What Broke (13:00 - 16:00)

**On screen:** Three problem->fix cards with red->green format

> **Now -- the honest part.** Three things that broke.
>
> **Bug one: the docs lied.** The documentation said the field was called "countryName." The API actually returned "name." Same data, different label. I only caught it by inspecting real responses. Lesson: always verify against the live system.
>
> **Bug two: 200 tokens, three work.** The API returned over 200 cryptocurrencies, but sandbox only supports three. Users would pick Dogecoin, get nothing, and think the app was broken. I pinned the working tokens to the top with green badges.
>
> **Bug three: a timing issue.** I built auto-quoting -- type an amount, quotes refresh after you stop typing. But the delayed function was reading an old error state from 800 milliseconds ago. The value had changed, but the function was still seeing the old one. Fixed it by capturing the result at the right moment instead of reading it after the delay.
>
> *[pause]*
>
> Every one of these taught me something I couldn't learn from a tutorial. Real bugs, real API, real data.

**[Clarity]** "Three things that broke" gives Rafael the count upfront. "Bug one, Bug two, Bug three" gives him position. He always knows where he is.
**[Rapport]** Vulnerability builds trust. This section is why Rafael will believe the rest.

---

## SLIDE 8 -- What I'd Improve (16:00 - 18:00)

**On screen:** Three improvement bullets + callout

> **If I had more time, three things I'd add.**
>
> **One** -- persistent storage. Right now transaction data lives in memory. Server restarts, it's gone. Production needs a database.
>
> **Two** -- webhook verification. I built the skeleton, but didn't implement the full security check. In production, you need to confirm incoming messages actually came from Meld.
>
> **Three** -- real-time updates. Instead of the user manually looking up a transaction, the app should push changes the moment they happen.
>
> I think knowing what you'd do differently matters as much as what you shipped. It shows you're thinking beyond the demo.

**[Clarity]** Same "three things" + "One, Two, Three" pattern. Consistent structure builds trust in your organization.

---

## SLIDE 9 -- Key Takeaways (18:00 - 19:30)

**On screen:** Three numbered takeaways

> **To wrap up -- three takeaways.**
>
> **One: Aggregation beats single-provider.** One integration, global coverage. This pattern isn't unique to crypto -- it applies anywhere you connect multiple data sources through a single platform.
>
> **Two: Scoring turns raw data into decisions.** rampScore takes complex signals and outputs a simple ranking anyone can act on. Users don't need to understand the algorithm. They just pick the top result.
>
> **Three: The best integrations are invisible.** The user sees a clean exchange. They don't see eight API routes, caching, retry logic, or webhooks. That's the point. Good infrastructure disappears.

**[Clarity]** "To wrap up" signals we're in the final section. No surprises left.
**[Clarity]** Each takeaway is universal, not crypto-specific. Rafael leaves thinking "this person can translate anything."

---

## SLIDE 10 -- Close (19:30 - 20:00)

**On screen:** "Questions?" + links + your name

> That's the Meld Crypto Exchange. Zero crypto experience to a deployed, production-aware application in under a week.
>
> The app is live -- I'll drop the link in the chat. Code's on GitHub.
>
> **I'd love to hear your questions.**

**[Clarity]** Short, confident close. Don't summarize again -- you just did that in the takeaways. Let it breathe.

---

## Structural Map (What Rafael Hears)

Rafael hears these explicit signposts throughout:

| Time | Signpost | Purpose |
|------|----------|---------|
| 0:15 | "I'll cover four things: problem, demo, build, learnings" | Roadmap |
| 0:30 | "Starting with the problem" | Section 1 begins |
| 3:30 | "That's the problem and platform. Now -- what I built" | Transition to Section 2 |
| 5:00 | "Let me show you the live app" | Demo start |
| 5:15 | "Feature 1... through Feature 8..." | Position within demo |
| 10:00 | "That was the what. Now the how" | Transition to Section 3 |
| 10:15 | "First... Second... Third..." | Position within architecture |
| 13:00 | "Now -- the honest part. Three things that broke" | Transition to Section 4 |
| 13:15 | "Bug one... Bug two... Bug three..." | Position within bugs |
| 16:00 | "Three things I'd add" | Sub-section |
| 18:00 | "To wrap up -- three takeaways" | Final section signal |
| 19:30 | "I'd love to hear your questions" | Clean close |

At **every moment**, Rafael knows where he is, what's coming next, and how far along the presentation is.

---

## Delivery Cheat Sheet

| If this happens... | Do this... |
|---|---|
| Demo won't load | "This is sandbox -- let me show the architecture instead." Go to slide 6. |
| Running long at 15 min | Cut Slide 8 to one sentence: "I documented three improvements in the README." |
| Running short at 17 min | Expand demo: `/demo` checklist, Transactions page, `/api/health` in a new tab, open support chat. |
| Rafael asks mid-slide | Answer it immediately. Flexibility beats structure. |
| Silence after your answer | Don't fill it. Smile. Wait. Silence means he's thinking. |
| Don't know the answer | "Great question -- I'd rather be accurate than guess. Can I follow up?" |

## Timing Summary

| Slide | Topic | Duration | Cumulative |
|-------|-------|----------|------------|
| 1 | Title + Roadmap | 0:30 | 0:30 |
| 2 | Problem | 1:30 | 2:00 |
| 3 | Meld Solution | 1:30 | 3:30 |
| 4 | What I Built | 1:30 | 5:00 |
| 5 | **LIVE DEMO** | **5:00** | **10:00** |
| 6 | Architecture | 3:00 | 13:00 |
| 7 | What Broke | 3:00 | 16:00 |
| 8 | Improvements | 2:00 | 18:00 |
| 9 | Takeaways | 1:30 | 19:30 |
| 10 | Close | 0:30 | 20:00 |
