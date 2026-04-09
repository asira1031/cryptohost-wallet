export type SupportedNetworkKey = "ethereum" | "bsc" | "polygon";

export type AssetType = "native" | "erc20";

export interface NetworkConfig {
  key: SupportedNetworkKey;
  label: string;
  chainId: number;
  symbol: string;
  rpcUrl: string;
  explorerTx: string;
  explorerAddress: string;
}

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  type: AssetType;
  addresses: Partial<Record<SupportedNetworkKey, string>>;
}

export interface TxHistoryItem {
  hash: string;
  network: SupportedNetworkKey;
  type: "send";
  assetSymbol: string;
  amount: string;
  to: string;
  from: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
  explorerUrl: string;
}