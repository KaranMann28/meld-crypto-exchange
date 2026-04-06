# Q&A Cheat Sheet -- Geotab Interview with Rafael

> Keep this on a second screen or phone. 25 minutes of Q&A after the presentation.

---

## About the Project

**Q: Why did you choose this project?**
> I was given this as a technical exercise for a fintech role, and I saw a chance to go way beyond the minimum. The assignment asked for a basic API integration -- I built a full exchange with buy/sell flows, animated UI, and a chat widget. I chose it for this presentation because it shows exactly what an SE does: take something complex, make it accessible, and demo it live.

**Q: How long did this take?**
> About 5 days from first reading the docs to deployed app. Day 1 was understanding the API and getting a basic integration working. Day 2-3 was building the full flow. Day 4 was the UI redesign to match Uniswap-level patterns. Day 5 was backend hardening and polish.

**Q: What would you do differently if you started over?**
> I'd design the UI first, not the API integration. I built the backend first and ended up redesigning the frontend twice because the layout didn't feel right. A quick wireframe of the exchange card would have saved a full day.

---

## Technical Depth

**Q: Walk me through the architecture.**
> Three layers. The frontend is React/Next.js with custom components -- the exchange card, token selector, settings dialog, provider cards. The backend is 8 API routes that proxy every call to Meld so the API key never touches the browser. And there's a shared library layer with the Meld HTTP client that handles auth, caching, retry on server errors, and typed error messages. Static data is cached for a week per Meld's recommendation. Quotes are always fetched fresh.

**Q: How does the API key stay secure?**
> It's a server-only environment variable. All Meld calls go through Next.js API routes, which run on the server. The browser never sees the key. The `.env.local` file is in `.gitignore`, and there's a `.env.example` with placeholder values for onboarding.

**Q: What's rampScore?**
> Meld's conversion-likelihood algorithm. Instead of sorting by cheapest price, it factors in historical success rates, regional compatibility, payment method fit, and real-time provider health. The cheapest provider might complete 40% of transactions in a region. The slightly more expensive one completes 95%. rampScore surfaces the one that actually works.

**Q: How do webhooks work in this?**
> When a user completes a purchase through the provider widget, Meld sends HTTP POST events to my `/api/webhook` endpoint. Events include PENDING, SETTLING, SETTLED, and FAILED. I store each event in memory, deduplicate by event ID to prevent double-processing, and enrich the transaction by fetching full details from Meld. The user can then look up their transaction on the Transactions page.

**Q: Tell me about the caching strategy.**
> Meld's own docs have a caching guide that recommends caching countries, currencies, payment methods, and limits for one week since they rarely change. I implemented a TTL-based Map cache in the API client -- each static endpoint gets a cache key, and if the data is less than 7 days old, it's returned from memory. Quotes, sessions, and transactions are never cached because prices change every second.

**Q: How does the retry logic work?**
> If Meld's server returns a 5xx error, the client waits one second and retries once before throwing. It's a simple pattern -- not exponential backoff, because one retry catches transient failures without adding complexity. If it fails twice, it surfaces a human-readable error to the user: "Meld service unavailable -- please try again later."

---

## Debugging & Problem-Solving

**Q: Tell me about the hardest bug you fixed.**
> The debounce closure bug. I built auto-quoting: type an amount, and after 800ms it fetches quotes. But JavaScript closures capture variable values at the time the function is created, not when it executes. So my debounced function was checking an error state from 800ms ago. If the user corrected an invalid amount, the closure still saw the old error and skipped the fetch. I fixed it by having `validateAmount()` return a boolean at call time and passing that directly into the closure.

**Q: How did you discover the field name mismatches?**
> I made my first API call and the data didn't render. The TypeScript types I wrote from the docs expected `countryName`, but the response had `name`. I opened the browser network tab, compared the actual JSON to the docs, and found four mismatches: `name` vs `countryName`, `name` vs `currencyName`, `chainCode`/`chainName` vs `networkCode`/`networkName`, and `symbolImageUrl` which wasn't in the docs at all. I updated my types to accept both variants as optional fields.

**Q: How do you approach learning a new API?**
> Start with the quickstart, get something working in 30 minutes. Then go back and read the full docs section by section. The Meld quickstart had me making API calls in 20 minutes. Then I read the caching guide and added TTL caching. Then the webhook docs and built the event handler. Then the Ramp Intelligence page and understood rampScore. Iterative depth, not all-at-once.

---

## About You / The Role

**Q: How do you explain technical concepts to non-technical people?**
> Analogies. Every technical concept has a real-world equivalent. rampScore is a reliability rating. On-ramp is exchanging currency at an airport. API caching is like keeping a phone book instead of calling directory assistance every time. Webhooks are push notifications. If the analogy lands, the technical depth follows naturally.

**Q: What interests you about Geotab?**
> The pattern is identical to what I just showed you. Geotab aggregates data from thousands of vehicles through one platform, ranks it with scoring algorithms like the Driver Safety Score, and exposes it through an open API and marketplace for partners. Meld does the same for crypto providers. I find that aggregation-plus-intelligence pattern genuinely fascinating, and the Solutions Engineering role is where I get to translate that depth for customers who need to understand it.

**Q: What's your experience with demos?**
> At ScalePad, I deliver 6-8 product demos per day across five SaaS products to 800+ MSPs. I was recognized twice as top-performing SE for close rates. Before that, at Deloitte, I delivered technical demos to groups of 50+ for GCP adoption. The key is storytelling -- don't show features, show outcomes. "Here's what this means for you" beats "here's what this button does" every time.

**Q: How do you handle a demo that breaks live?**
> It happened during a Docebo interview. The AI chatbot took longer than expected to respond, and I acknowledged it openly: "This is a great example of why sandbox testing has limitations." The panel specifically praised me for not faking confidence. Transparency builds more trust than perfection.

**Q: What do you know about Geotab's products?**
> Geotab is the global leader in IoT and connected transportation. The GO device collects vehicle data -- GPS, engine diagnostics, driver behavior -- and the MyGeotab platform turns that into actionable insights. The Driver Safety Scorecard ranks drivers 0-100 based on braking, speeding, seatbelt use. The open API and Marketplace let partners build custom fleet solutions. I actually signed up for a MyGeotab demo database to explore the platform before this conversation.

**Q: Where do you see yourself growing in this role?**
> Short term: mastering Geotab's platform and becoming the technical trusted advisor for partners and end-users. Medium term: building tools and educational content that help the broader partner ecosystem succeed -- the docs, the demos, the enablement. Long term: mentoring other SEs and driving the strategy for how Geotab's solutions are positioned technically in the market.

---

## If You Get Stuck

- **Don't know the answer:** "That's a great question, and I want to give you an accurate answer rather than guess. Can I follow up on that after I dig into it?"
- **Too technical for the audience:** "Let me zoom out -- the key thing is [simple version]."
- **Question about something you haven't built:** "I haven't implemented that yet, but here's how I'd approach it: [framework]."
- **Silence after your answer:** That's okay. Don't fill silence with rambling. Smile and wait.
