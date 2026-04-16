export type SupportedChain = "eth" | "bnb";

export type SwapQuoteRequest = {
  chain: SupportedChain;
  fromToken: string;
  toToken: string;
  amountWei: string;
  walletAddress: string;
  slippage?: number;
};

export type SwapApiResponse = {
  ok: boolean;
  quote?: unknown;
  tx?: {
    to: string;
    data: string;
    value: string;
    gas?: string;
    gasPrice?: string;
  };
  error?: string;
  raw?: unknown;
};