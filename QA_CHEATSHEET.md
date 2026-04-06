# Q&A Cheat Sheet -- 25 Minutes with Rafael

> Pull this up on a second screen or phone during the Q&A.
> Focus areas: **Technical Translation** + **Rapport Building** + **Clarity**
>
> **Clarity rule for Q&A:** Structure every answer as: **(1) direct answer first, (2) one supporting detail, (3) stop.** Under 60 seconds. Don't monologue. If the answer has multiple parts, say the count first: "Two reasons..." or "Three layers..."

---

## ABOUT THE PROJECT

**Q: Why did you choose this project to present?**
> I was given this as a technical exercise -- the assignment asked for a basic API integration. I went way beyond the minimum because I wanted to show what an SE actually does: take something complex, make it look simple, and demo it live. The fact that I'd never worked with crypto before made it an even better test of how quickly I can learn and translate.

**Q: How long did it take?**
> About five days. Day one was understanding the API and getting basic calls working. Days two and three were building the full integration. Day four was the UI redesign -- I rebuilt the frontend to match the patterns top exchanges use. Day five was hardening the backend and writing documentation.

**Q: What would you do differently?**
> Design the UI first. I built the backend first and had to redesign the frontend twice because the layout didn't match the user's mental model. A quick wireframe of the exchange card would have saved a full day.

**Q: Walk me through the architecture.**
> Three layers. The frontend is React -- twelve custom components for the exchange card, token selector, settings, provider cards. The backend is eight API routes that proxy every call to Meld so the API key stays on the server. And there's a shared library with the HTTP client that handles authentication, caching, error messages, and retry logic. Static data is cached for a week. Quotes are always fresh.

---

## TECHNICAL TRANSLATION

**Q: How do you explain technical concepts to non-technical people?**
> Analogies. Every technical concept has something people already understand. rampScore is a reliability rating. On-ramp is like exchanging currency at an airport. API caching is keeping a phone book instead of calling directory assistance every time. Webhooks are push notifications. If the analogy clicks, the technical depth follows naturally.

**Q: What's rampScore in simple terms?**
> It's a reliability rating for crypto providers. Instead of just showing the cheapest option, Meld predicts which provider will actually complete the transaction -- based on track record, regional fit, and real-time health. The cheapest option might fail 60% of the time. A slightly pricier one completes 95% of the time. rampScore tells you which one actually works.

**Q: What's an on-ramp / off-ramp?**
> On-ramp is turning regular money into crypto -- like exchanging dollars for euros at the airport, but for Bitcoin. Off-ramp is the reverse -- turning crypto back into regular money you can spend.

**Q: What's a webhook?**
> It's a push notification for servers. Instead of my app checking "is the transaction done yet?" every five seconds, Meld sends my app a message the moment something changes. More efficient, more real-time.

**Q: Why is the API key on the server, not the browser?**
> If the key was in the browser, anyone could open developer tools, copy it, and use it. By keeping it on the server and proxying every call, the key is never visible to the user. It's a basic security pattern but critical for fintech.

---

## DEBUGGING & PROBLEM-SOLVING

**Q: What was the hardest bug?**
> The auto-quote timing issue. When you type an amount, the app waits 800 milliseconds before fetching quotes. But the delayed function was looking at an old validation state -- it was seeing "invalid" even though the user had already corrected the amount. The fix was capturing the validation result at the moment of typing, not reading it 800ms later. It's the kind of bug that only shows up with real user interaction, not in a unit test.

**Q: How did you discover the API field name mismatches?**
> I wrote my TypeScript types from the documentation, made my first API call, and nothing rendered. Opened the browser network tab, compared the actual JSON to the docs, and found four mismatches. The docs said countryName, the API returned name. Same for currencies and network codes. I updated my types to accept both variants so the app handles either.

**Q: How do you approach learning a new API?**
> Quickstart first -- get something working in 30 minutes. Then go back and read the full docs section by section. The Meld quickstart had me making API calls in twenty minutes. Then I read the caching guide and added a cache layer. Then the webhook docs and built the event handler. Then the Ramp Intelligence page and understood their scoring algorithm. Start shallow, go deep iteratively.

---

## ABOUT YOU & THE ROLE

**Q: What interests you about Geotab?**
> The pattern is the same. Geotab aggregates data from thousands of vehicles through one platform, scores it with algorithms like the Driver Safety Scorecard, and exposes it through an open API and marketplace. That's the same aggregation-plus-intelligence pattern I just showed you with crypto providers. I find that pattern genuinely interesting, and the Solutions Engineering role is where I get to help customers see the value in it.

**Q: What's your demo experience?**
> At ScalePad I deliver six to eight product demos a day across five products to MSPs. I was recognized twice as top-performing SE for close rates. At Deloitte I presented to groups of fifty-plus on GCP adoption. The key is storytelling -- don't show features, show outcomes. "Here's what this means for you" lands better than "here's what this button does."

**Q: How do you handle a demo that breaks?**
> It happened during a Docebo interview. The AI chatbot took longer than expected to respond. I said openly, "This is a sandbox -- it does this sometimes. It's actually a great example of why we test in staging before production." The panel specifically praised me for being transparent instead of faking it. Trust comes from honesty, not perfection.

**Q: How do you build rapport with a technical audience?**
> Ask questions, don't just present. During the demo I asked you about comparing prices across providers -- that's intentional. It connects what I'm showing to something you've experienced. People engage when they see themselves in the story. The other thing is vulnerability: showing what broke, admitting what I'd improve. That signals "I'm sharing real experience," not performing.

**Q: Where do you see yourself in this role?**
> Short term: mastering Geotab's platform and becoming the trusted technical advisor for partners. Medium term: building tools and content that help the whole partner ecosystem -- better docs, reusable demos, training materials. Long term: mentoring other SEs and shaping how Geotab's solutions are positioned in the market.

---

## CURVEBALL QUESTIONS

**Q: What do you know about Geotab's technology?**
> Geotab uses the GO device to collect vehicle data -- GPS, engine diagnostics, driver behavior -- and the MyGeotab platform turns that into dashboards, safety scores, and fleet optimization insights. The Driver Safety Scorecard weighs things like hard braking, speeding, and seatbelt use on a 0-100 scale. The open platform and Marketplace let partners build on top of it, similar to how Meld lets developers build on their API.

**Q: How is what you built relevant to fleet management?**
> The architecture is identical. Meld aggregates multiple crypto providers through one API. Geotab aggregates multiple vehicle sensors through one platform. Both use scoring algorithms to turn noisy data into simple decisions -- rampScore for providers, Safety Score for drivers. Both expose an open API for partners to build custom solutions. The domain is different, but the engineering pattern is the same.

**Q: Can you explain something about this project that you'd explain differently to an engineer vs. a fleet manager?**
> To an engineer: "The API client implements a TTL-based cache with a 7-day expiry for static endpoints and a single-retry with 1-second backoff for 5xx responses." To a fleet manager: "We save lookup data for a week so the app loads faster, and if the service hiccups, we automatically try again before showing an error." Same concept, different vocabulary. That translation is the whole job.

---

## IF YOU GET STUCK

| Situation | Response |
|---|---|
| Don't know the answer | "Great question. I want to give you an accurate answer -- can I follow up after I look into it?" |
| Question is too broad | "Let me focus on one specific aspect of that..." |
| Question about something you didn't build | "I haven't implemented that yet, but here's how I'd approach it." |
| Silence after your answer | Don't fill it. Smile, make eye contact, wait. Silence means they're thinking. |
| Rafael redirects the topic | Follow his lead. Flexibility is a feature, not a bug. |
