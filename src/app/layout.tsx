import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApiStatus } from "@/components/api-status";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatWidget } from "@/components/chat-widget";
import { AnimatedBackground } from "@/components/animated-bg";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meld Crypto Exchange | On-Ramp Integration",
  description:
    "Buy and sell cryptocurrency through multiple providers using Meld's White-Label API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AnimatedBackground />

        <header className="border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 group-hover:from-violet-400 group-hover:to-indigo-500 transition-all" />
                <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight leading-none">
                  Meld<span className="text-violet-400">Exchange</span>
                </span>
                <span className="text-[9px] text-muted-foreground leading-none mt-0.5">
                  Crypto On-Ramp
                </span>
              </div>
            </a>

            <nav className="flex items-center gap-1 text-sm">
              <a
                href="/"
                className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Buy
              </a>
              <a
                href="/transactions"
                className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Transactions
              </a>
              <div className="w-px h-5 bg-border/50 mx-1" />
              <ApiStatus />
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="flex-1 relative">{children}</main>

        <footer className="border-t border-border/40 bg-background/60 backdrop-blur-xl py-5">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Meld White-Label API &middot; Sandbox</span>
            <div className="flex items-center gap-3">
              <a
                href="https://docs.meld.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                API Docs
              </a>
              <a
                href="https://github.com/KaranMann28/meld-crypto-exchange"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <span>Built by Kam Mann</span>
            </div>
          </div>
        </footer>

        <ChatWidget />
      </body>
    </html>
  );
}
