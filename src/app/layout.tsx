import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApiStatus } from "@/components/api-status";

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
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <span className="font-semibold tracking-tight">
                Meld Exchange
              </span>
            </a>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">
                Buy Crypto
              </a>
              <a
                href="/transactions"
                className="hover:text-foreground transition-colors"
              >
                Transactions
              </a>
              <ApiStatus />
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/40 py-6">
          <div className="max-w-5xl mx-auto px-4 text-center text-xs text-muted-foreground">
            Meld White-Label API Integration &middot; Sandbox Environment
            &middot; Built by Kam Mann
          </div>
        </footer>
      </body>
    </html>
  );
}
