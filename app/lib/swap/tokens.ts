export const CHAIN_CONFIG = {
  eth: {
    chainId: 1,
    name: "Ethereum",
    nativeSymbol: "ETH",
    explorerTx: "https://etherscan.io/tx/",
  },
  bnb: {
    chainId: 56,
    name: "BNB Chain",
    nativeSymbol: "BNB",
    explorerTx: "https://bscscan.com/tx/",
  },
} as const;

export const NATIVE_TOKEN_PLACEHOLDER =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const ETH_USDT =
  "0xdAC17F958D2ee523a2206206994597C13D831ec7";

export const BNB_USDT =
  "0x55d398326f99059fF775485246999027B3197955";