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
