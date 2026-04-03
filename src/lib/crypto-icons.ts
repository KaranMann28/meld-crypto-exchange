const ICONS: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  USDC: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  USDT: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  XRP: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
};

export function getCryptoIconUrl(code: string): string {
  const base = code.split("_")[0].toUpperCase();
  return ICONS[base] ?? `https://ui-avatars.com/api/?name=${base}&background=6d28d9&color=fff&size=32&bold=true`;
}

const FIAT_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  BRL: "🇧🇷",
  JPY: "🇯🇵",
  INR: "🇮🇳",
  MXN: "🇲🇽",
  CHF: "🇨🇭",
  SGD: "🇸🇬",
  HKD: "🇭🇰",
  KRW: "🇰🇷",
  SEK: "🇸🇪",
  NOK: "🇳🇴",
  DKK: "🇩🇰",
  PLN: "🇵🇱",
  CZK: "🇨🇿",
  TRY: "🇹🇷",
  NZD: "🇳🇿",
  ZAR: "🇿🇦",
  THB: "🇹🇭",
  TWD: "🇹🇼",
  PHP: "🇵🇭",
  IDR: "🇮🇩",
  CLP: "🇨🇱",
  COP: "🇨🇴",
  ARS: "🇦🇷",
  PEN: "🇵🇪",
  NGN: "🇳🇬",
  KES: "🇰🇪",
  GHS: "🇬🇭",
  EGP: "🇪🇬",
  MAD: "🇲🇦",
  AED: "🇦🇪",
  SAR: "🇸🇦",
  ILS: "🇮🇱",
  VND: "🇻🇳",
  MYR: "🇲🇾",
};

export function getFiatFlag(code: string): string {
  return FIAT_FLAGS[code] ?? "💱";
}

const PROVIDER_COLORS: Record<string, string> = {
  TRANSAK: "#0364FF",
  UNLIMIT: "#00D4AA",
  SIMPLEX: "#FF6B2B",
  ROBINHOOD: "#00C805",
  STRIPE: "#635BFF",
  TOPPER: "#FF3366",
  SARDINE: "#2563EB",
  MERCURYO: "#39E58C",
  BANXA: "#00DCB4",
  TRANSFI: "#7C3AED",
  COINBASEPAY: "#0052FF",
  PAYBIS: "#F7931A",
};

export function getProviderColor(name: string): string {
  return PROVIDER_COLORS[name] ?? "#8B5CF6";
}

export interface PaymentMethodInfo {
  label: string;
  icon: string;
  description: string;
}

const PAYMENT_INFO: Record<string, PaymentMethodInfo> = {
  CREDIT_DEBIT_CARD: { label: "Card", icon: "💳", description: "Visa, Mastercard, etc." },
  APPLE_PAY: { label: "Apple Pay", icon: "🍎", description: "Pay with Face ID / Touch ID" },
  GOOGLE_PAY: { label: "Google Pay", icon: "📱", description: "Pay with your Google account" },
  SEPA: { label: "SEPA Transfer", icon: "🏦", description: "EU bank transfer" },
  PIX: { label: "PIX", icon: "⚡", description: "Brazil instant payment" },
  ACH: { label: "ACH Transfer", icon: "🏛️", description: "US bank transfer" },
  BANK_TRANSFER: { label: "Bank Transfer", icon: "🏦", description: "Wire transfer" },
  OPEN_BANKING: { label: "Open Banking", icon: "🔗", description: "Direct bank connection" },
  UK_FASTER_PAYMENTS: { label: "Faster Payments", icon: "🇬🇧", description: "UK instant transfer" },
  UPI: { label: "UPI", icon: "🇮🇳", description: "India unified payments" },
  SPEI: { label: "SPEI", icon: "🇲🇽", description: "Mexico bank transfer" },
  PAYOUT_TO_CARD: { label: "Card Payout", icon: "💳", description: "Receive to debit card" },
};

export function getPaymentMethodInfo(key: string): PaymentMethodInfo {
  return PAYMENT_INFO[key] ?? {
    label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    icon: "💰",
    description: "Payment method",
  };
}
