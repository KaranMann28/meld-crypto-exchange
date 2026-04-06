"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type UiMessage = { role: "user" | "bot"; text: string };

function toApiMessages(messages: UiMessage[]) {
  return messages.slice(1).map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("assistant" as const),
    text: m.text,
  }));
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      role: "bot",
      text: "Hi! I can help you with the exchange. Try asking about supported tokens, fees, or how to buy crypto.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d: { aiEnabled?: boolean }) => setAiEnabled(Boolean(d.aiEnabled)))
      .catch(() => setAiEnabled(false));
  }, []);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setLoading(true);

    const withUser: UiMessage[] = [...messages, { role: "user", text: q }];
    setMessages(withUser);

    const apiMessages = toApiMessages(withUser);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = (await res.json()) as { text?: string; error?: string; code?: string };

      if (res.ok && data.text) {
        setMessages((m) => [...m, { role: "bot", text: data.text! }]);
        return;
      }

      const fallback =
        res.status === 429 && data.code === "RATE_LIMIT"
          ? `${getBotReply(q)}\n\nToo many messages in a short window — wait a bit and try again.`
          : res.status === 503 && data.code === "NO_API_KEY"
            ? `${getBotReply(q)}\n\nTip: add GEMINI_API_KEY to .env.local (server-only) to enable the AI assistant.`
            : data.error
              ? `${getBotReply(q)}\n\n(${data.error})`
              : getBotReply(q);

      setMessages((m) => [...m, { role: "bot", text: fallback }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: `${getBotReply(q)}\n\n(Network error — try again.)` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 flex items-center justify-center"
        aria-expanded={open}
        aria-label={open ? "Close support chat" : "Open support chat"}
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-50 w-80 max-h-[420px] rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/20 flex flex-col overflow-hidden"
            role="dialog"
            aria-label="Support chat"
          >
            <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Meld Support</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {aiEnabled === null
                    ? "Online"
                    : aiEnabled
                      ? "Online · Gemini + FAQ fallback"
                      : "Online · FAQ (set GEMINI_API_KEY for AI)"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.open(
                    "mailto:support@meld.io?subject=Bug Report — Meld Exchange&body=Describe the issue:",
                    "_blank",
                  );
                }}
                className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-accent transition-colors"
              >
                Report issue
              </button>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === "bot"
                      ? "bg-muted text-foreground rounded-bl-md"
                      : "bg-violet-600 text-white ml-auto rounded-br-md"
                  }`}
                >
                  {m.text}
                </motion.div>
              ))}
              {loading && (
                <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-bl-md bg-muted text-foreground text-xs">
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse">Thinking</span>
                    <span className="animate-pulse delay-75">.</span>
                    <span className="animate-pulse delay-150">.</span>
                    <span className="animate-pulse delay-200">.</span>
                  </span>
                </div>
              )}
            </div>

            <div className="p-2 border-t border-border/40">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder={loading ? "Please wait…" : "Type a message…"}
                  disabled={loading}
                  className="flex-1 text-xs bg-muted/50 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-violet-500/50 disabled:opacity-60"
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => void handleSend()}
                  disabled={loading || !input.trim()}
                  className="p-2 rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  aria-label="Send message"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getBotReply(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes("token") || lower.includes("coin") || lower.includes("crypto"))
    return "In sandbox mode, we support BTC, ETH, and USDC. Look for the green 'Sandbox' badge when selecting a token. In production, Meld supports 176+ tokens across multiple chains.";
  if (lower.includes("fee"))
    return "Fees vary by provider and are shown in the quote breakdown. They include network fees (blockchain gas), provider fees, and partner fees. The best provider is auto-ranked by Meld's rampScore.";
  if (lower.includes("buy") || lower.includes("how"))
    return "1. Enter the amount you want to spend\n2. Select the crypto token (BTC/ETH/USDC for sandbox)\n3. Click 'Get Quotes' to compare providers\n4. Enter your wallet address\n5. Click 'Buy with [provider]' to complete";
  if (lower.includes("wallet"))
    return "You'll need a crypto wallet address to receive your purchased tokens. Click 'Use test address' for a sandbox-safe wallet, or paste your own.";
  if (lower.includes("sandbox") || lower.includes("test"))
    return "This app runs in Meld's sandbox environment. Use test card 4111 1111 1111 1111 (exp: 10/33, CVV: 123) to simulate a purchase. No real money is charged.";
  if (lower.includes("ramp") || lower.includes("score"))
    return "rampScore is Meld's proprietary algorithm that ranks providers by conversion likelihood — not just price. It factors in historical success rates, regional compatibility, and real-time provider health.";
  if (lower.includes("report") || lower.includes("bug") || lower.includes("issue"))
    return "Click 'Report issue' at the top of this chat to open an email to our support team, or describe the problem here and I'll help troubleshoot.";
  return "I'm a simple FAQ bot for this demo. Try asking about: supported tokens, fees, how to buy, wallets, sandbox testing, or rampScore. For complex issues, click 'Report issue' above.";
}
