"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "bot"; text: string }>>([
    { role: "bot", text: "Hi! I can help you with the exchange. Try asking about supported tokens, fees, or how to buy crypto." },
  ]);
  const [input, setInput] = useState("");

  function handleSend() {
    if (!input.trim()) return;
    const q = input.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");

    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: getBotReply(q) }]);
    }, 600);
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 flex items-center justify-center"
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
          >
            <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Meld Support</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Online
                </div>
              </div>
              <button
                onClick={() => {
                  window.open("mailto:support@meld.io?subject=Bug Report — Meld Exchange&body=Describe the issue:", "_blank");
                }}
                className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-accent transition-colors"
              >
                Report issue
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    m.role === "bot"
                      ? "bg-muted text-foreground rounded-bl-md"
                      : "bg-violet-600 text-white ml-auto rounded-br-md"
                  }`}
                >
                  {m.text}
                </motion.div>
              ))}
            </div>

            <div className="p-2 border-t border-border/40">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 text-xs bg-muted/50 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-violet-500/50"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  className="p-2 rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-colors"
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
