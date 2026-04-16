import type { TokenConfig } from "../../types/wallet";

export const TOKENS: TokenConfig[] = [
  {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    type: "erc20",
    addresses: {
      ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      bsc: "0x55d398326f99059fF775485246999027B3197955",
      polygon: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    },
  },
];