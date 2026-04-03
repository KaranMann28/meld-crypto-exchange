export interface MeldCountry {
  countryCode: string;
  name: string;
  countryName?: string;
  flagImageUrl?: string;
  flagUrl?: string;
  states?: string[];
  regions?: string[] | null;
}

export interface CountryDefaults {
  countryCode: string;
  defaultCurrencyCode: string;
  defaultPaymentMethods: string[];
}

export interface FiatCurrency {
  currencyCode: string;
  currencyName: string;
  flagUrl?: string;
}

export interface CryptoCurrency {
  currencyCode: string;
  name: string;
  currencyName?: string;
  chainCode: string;
  chainName: string;
  networkCode?: string;
  networkName?: string;
  chainId?: string | null;
  contractAddress?: string | null;
  symbolImageUrl?: string;
}

export interface PaymentMethod {
  paymentMethod: string;
  paymentMethodName?: string;
  logos?: { darkUrl?: string; lightUrl?: string };
}

export interface RampIntelligence {
  rampScore: number;
  lowKyc: boolean;
}

export interface CryptoQuote {
  transactionType: string;
  sourceAmount: number;
  sourceAmountWithoutFees: number;
  fiatAmountWithoutFees: number;
  destinationAmountWithoutFees: number | null;
  sourceCurrencyCode: string;
  countryCode: string;
  totalFee: number;
  networkFee: number;
  transactionFee: number;
  partnerFee: number;
  destinationAmount: number;
  destinationCurrencyCode: string;
  exchangeRate: number;
  paymentMethodType: string;
  serviceProvider: string;
  rampIntelligence: RampIntelligence;
}

export interface QuoteRequest {
  countryCode: string;
  sourceCurrencyCode: string;
  destinationCurrencyCode: string;
  sourceAmount: number;
  paymentMethodType?: string;
  walletAddress?: string;
}

export interface QuoteResponse {
  quotes: CryptoQuote[];
  message?: string | null;
  error?: string | null;
}

export interface SessionRequest {
  sessionType: "BUY" | "SELL";
  sessionData: {
    countryCode: string;
    sourceCurrencyCode: string;
    sourceAmount: string;
    destinationCurrencyCode: string;
    walletAddress: string;
    serviceProvider: string;
    paymentMethodType?: string;
    redirectUrl?: string;
  };
  externalCustomerId?: string;
  externalSessionId?: string;
}

export interface SessionResponse {
  id: string;
  externalSessionId: string;
  externalCustomerId: string;
  customerId: string;
  widgetUrl: string;
  serviceProviderWidgetUrl: string;
  token: string;
}

export interface WebhookPayload {
  requestId: string;
  accountId: string;
  paymentTransactionId: string;
  customerId: string;
  externalCustomerId: string;
  externalSessionId: string;
  paymentTransactionStatus: string;
  transactionType: string;
  sessionId: string;
}

export interface WebhookEvent {
  eventType: string;
  eventId: string;
  timestamp: string;
  accountId: string;
  profileId: string;
  version: string;
  payload: WebhookPayload;
}

export interface TransactionDetails {
  id: string;
  transactionType: string;
  status: string;
  sourceAmount: number;
  sourceCurrencyCode: string;
  destinationAmount: number;
  destinationCurrencyCode: string;
  paymentMethodType: string;
  serviceProvider: string;
  createdAt: string;
  updatedAt: string;
  countryCode: string;
  cryptoDetails?: {
    destinationWalletAddress: string;
    totalFee: number;
    networkFee: number;
    transactionFee: number;
    partnerFee: number;
    blockchainTransactionId?: string;
  };
}
