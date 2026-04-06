"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES: SlideData[] = [
  {
    id: "title",
    topLabel: "Technical Presentation",
    title: "Meld Crypto Exchange",
    subtitle: "Building a full-stack crypto on-ramp integration\nfrom API docs to deployed product in one week",
    footer: "Kam Mann · meld-crypto-exchange.vercel.app",
    visual: "logo",
  },
  {
    id: "problem",
    topLabel: "The Problem",
    title: "Buying crypto is fragmented",
    bullets: [
      "10+ providers — each with different fees, countries, and payment methods",
      "No single source of truth for the best price",
      "Users have to check Coinbase, Transak, MoonPay, etc. one by one",
    ],
    callout: "It's like booking a flight by visiting every airline's website instead of using Kayak.",
    visual: "fragmented",
  },
  {
    id: "meld",
    topLabel: "The Solution",
    title: "Meld = Kayak for crypto",
    bullets: [
      "One API call → quotes from 50+ providers simultaneously",
      "rampScore ranks by conversion likelihood, not just price",
      "180+ countries, 150+ fiat currencies, 54 payment methods",
    ],
    callout: "The cheapest flight means nothing if the airline cancels half its routes. rampScore is about which provider actually delivers.",
    visual: "flow",
  },
  {
    id: "built",
    topLabel: "What I Built",
    title: "Full exchange in < 1 week",
    bullets: [
      "Complete 7-step White-Label API integration",
      "Buy AND sell flows with real-time quote comparison",
      "Dark/light mode, animated UI, token selector, settings",
      "AI support chat (Gemini) — key server-only + FAQ fallback",
      "/demo presenter checklist, /slides deck, transaction tracking",
      "Zero crypto experience → deployed production-aware app",
    ],
    visual: "screenshot",
  },
  {
    id: "demo",
    topLabel: "Live Demo",
    title: "meld-crypto-exchange.vercel.app",
    subtitle: "Switch to browser — /demo has the ordered checklist",
    bullets: [
      "0. /api/health — prove sandbox is live (green dot in header too)",
      "1. $200 → validates against Meld min/max limits",
      "2. Get Quotes → ranked by rampScore + fee breakdown",
      "3. Swap arrow → Sell mode (crypto → fiat quotes)",
      "4. Settings → countries, currencies, payment methods",
      "5. Token selector → sandbox badges, search",
      "6. Support chat — Gemini on server; rate-limited, no key in browser",
    ],
    callout: "Have you ever compared prices across providers for anything — flights, insurance, SaaS vendors? That's exactly what this does.",
    visual: "demo",
  },
  {
    id: "architecture",
    topLabel: "How I Built It",
    title: "Three clean layers",
    columns: [
      { heading: "Frontend", items: ["Next.js 16 + React", "12 custom components", "Framer Motion animations", "shadcn/ui design system"] },
      { heading: "Backend", items: ["9 API routes (Meld proxy + /api/chat)", "Secrets never in browser — Meld + Gemini", "7-day TTL cache, chat rate limits", "Retry on 5xx, structured logs"] },
      { heading: "Meld Client", items: ["Typed HTTP wrapper", "BASIC auth + API versioning", "Human-readable error mapping", "Webhook idempotency"] },
    ],
    callout: "If you handed this repo to another dev, they'd have it running in 5 minutes. That's developer empathy.",
  },
  {
    id: "broke",
    topLabel: "What Broke",
    title: "Debugging is where understanding happens",
    challenges: [
      { problem: "Docs showed countryName", fix: "API returns name", lesson: "Always verify against the live API" },
      { problem: "200 tokens in dropdown", fix: "Only 3 work in sandbox", lesson: "Pin working options to the top with badges" },
      { problem: "Auto-quote checked stale state", fix: "JS closures capture at creation time", lesson: "Return validation result, don't read state in delay" },
    ],
  },
  {
    id: "improve",
    topLabel: "What I'd Improve",
    title: "Thinking beyond the demo",
    bullets: [
      "Persistent storage — database instead of in-memory webhook store",
      "Webhook signature verification — HMAC validation for security",
      "Distributed rate limits — Redis/KV instead of in-memory for chat",
      "Real-time push — WebSockets instead of manual transaction lookup",
    ],
    callout: "The ability to identify what you'd do differently is just as important as what you shipped.",
  },
  {
    id: "takeaways",
    topLabel: "Key Takeaways",
    title: "Three universal patterns",
    numbered: [
      { label: "Aggregation beats single-provider", detail: "One integration, global coverage. Same pattern for any multi-source platform." },
      { label: "Scoring turns data into decisions", detail: "rampScore outputs a simple ranking from complex multi-factor data. Users just pick the top result." },
      { label: "The best integrations are invisible", detail: "8 API routes, caching, retry logic, webhook handlers — the user sees none of it." },
    ],
  },
  {
    id: "close",
    topLabel: "Thank You",
    title: "Questions?",
    subtitle: "Zero crypto experience → deployed integration in < 1 week",
    footer: "Live: meld-crypto-exchange.vercel.app\nCode: github.com/KaranMann28/meld-crypto-exchange\nKam Mann",
    visual: "logo",
  },
];

interface SlideData {
  id: string;
  topLabel?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  numbered?: { label: string; detail: string }[];
  columns?: { heading: string; items: string[] }[];
  challenges?: { problem: string; fix: string; lesson: string }[];
  callout?: string;
  footer?: string;
  visual?: string;
}

export default function SlidesPage() {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback((n: number) => {
    if (n < 0 || n >= SLIDES.length) return;
    setDir(n > current ? 1 : -1);
    setCurrent(n);
  }, [current]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); go(current + 1); }
      if (e.key === "ArrowLeft" || e.key === "Backspace") { e.preventDefault(); go(current - 1); }
      if (e.key === "Home") go(0);
      if (e.key === "End") go(SLIDES.length - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, go]);

  const slide = SLIDES[current];

  return (
    <div
      className="fixed inset-0 bg-[#09090f] text-white overflow-hidden select-none"
      onClick={(e) => {
        const x = e.clientX / window.innerWidth;
        if (x > 0.5) go(current + 1);
        else go(current - 1);
      }}
    >
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-600/[0.06] blur-[150px]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/[0.05] blur-[150px]" />

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={slide.id}
          custom={dir}
          initial={{ opacity: 0, x: dir * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -60 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 flex flex-col items-center justify-center px-16 py-12"
        >
          <div className="w-full max-w-[960px] space-y-8">
            {slide.topLabel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm font-semibold text-violet-400 uppercase tracking-widest"
              >
                {slide.topLabel}
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-5xl font-bold tracking-tight leading-tight"
            >
              {slide.title}
            </motion.h1>

            {slide.subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-xl text-white/50 whitespace-pre-line leading-relaxed max-w-[700px]"
              >
                {slide.subtitle}
              </motion.p>
            )}

            {slide.bullets && (
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-3 text-lg text-white/70 leading-relaxed"
              >
                {slide.bullets.map((b, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.08 }}
                    className="flex gap-3"
                  >
                    <span className="text-violet-400 mt-1 shrink-0">&#9656;</span>
                    <span>{b}</span>
                  </motion.li>
                ))}
              </motion.ul>
            )}

            {slide.numbered && (
              <div className="space-y-6">
                {slide.numbered.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.12 }}
                    className="flex gap-5 items-start"
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-lg shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-xl font-semibold">{item.label}</div>
                      <div className="text-base text-white/50 mt-0.5">{item.detail}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {slide.columns && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-6"
              >
                {slide.columns.map((col, ci) => (
                  <motion.div
                    key={ci}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + ci * 0.1 }}
                    className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 space-y-3"
                  >
                    <div className="text-base font-bold text-violet-400">{col.heading}</div>
                    <ul className="space-y-1.5 text-sm text-white/60">
                      {col.items.map((item, ii) => (
                        <li key={ii} className="flex gap-2">
                          <span className="text-violet-500/60 mt-0.5">&#8226;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {slide.challenges && (
              <div className="space-y-4">
                {slide.challenges.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 flex gap-4 items-start"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400 text-sm font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-red-400/80 line-through">{c.problem}</span>
                        <span className="text-white/40 mx-2">&rarr;</span>
                        <span className="text-emerald-400">{c.fix}</span>
                      </div>
                      <div className="text-white/40 italic">{c.lesson}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {slide.callout && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="border-l-2 border-violet-500/50 pl-5 text-base text-white/40 italic leading-relaxed max-w-[700px]"
              >
                &ldquo;{slide.callout}&rdquo;
              </motion.div>
            )}

            {slide.footer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-white/25 whitespace-pre-line pt-4"
              >
                {slide.footer}
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
          initial={false}
          animate={{ width: `${((current + 1) / SLIDES.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Slide counter */}
      <div className="fixed bottom-4 right-6 text-xs text-white/20 font-mono tabular-nums">
        {current + 1} / {SLIDES.length}
      </div>

      {/* Navigation hint */}
      {current === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="fixed bottom-4 left-6 text-xs text-white/15"
        >
          Arrow keys or click to navigate
        </motion.div>
      )}
    </div>
  );
}
