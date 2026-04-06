import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live demo checklist | Meld Exchange",
  description: "Ordered presenter flow: health, exchange, AI chat, transactions, slides.",
};

const STEPS = [
  {
    title: "Health check",
    detail: "Confirm sandbox connectivity before the room fills in.",
    href: "/api/health",
    external: false,
    cta: "Open /api/health",
  },
  {
    title: "Exchange",
    detail: "$200 → Get Quotes → expand fee breakdown → swap to Sell.",
    href: "/",
    external: false,
    cta: "Open exchange",
  },
  {
    title: "AI support chat",
    detail: "Floating button — ask a follow-up (fees, rampScore, sandbox cards). Key stays on the server.",
    href: "/",
    external: false,
    cta: "Open app (chat)",
  },
  {
    title: "Transactions",
    detail: "Lookup by ID; show recent sessions from this browser.",
    href: "/transactions",
    external: false,
    cta: "Transactions",
  },
  {
    title: "Slides",
    detail: "Keyboard or click — full narrative deck in-app.",
    href: "/slides",
    external: false,
    cta: "Open slides",
  },
];

export default function DemoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">Presenter</p>
        <h1 className="text-2xl font-bold tracking-tight">Live demo checklist</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ordered flow for a technical presentation. Meld and Gemini keys live only in environment variables — never in the repo or browser bundle.
        </p>
      </div>

      <ol className="space-y-4">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 flex gap-4 items-start"
          >
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center text-sm font-bold shrink-0">
              {i + 1}
            </div>
            <div className="space-y-2 min-w-0 flex-1">
              <div className="font-semibold text-sm">{s.title}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.detail}</p>
              <Link
                href={s.href}
                className="inline-flex text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
              >
                {s.cta} →
              </Link>
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
        <p>
          <span className="font-medium text-foreground">Security:</span> See{" "}
          <Link href="https://github.com/KaranMann28/meld-crypto-exchange/blob/master/SECURITY.md" className="text-violet-600 dark:text-violet-400 hover:underline">
            SECURITY.md
          </Link>{" "}
          in the repo for env vars, rotation, and chat limits.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          ← Back to exchange
        </Link>
        <span className="text-border">|</span>
        <Link href="/slides" className="text-muted-foreground hover:text-foreground transition-colors">
          Slides
        </Link>
      </div>
    </div>
  );
}
