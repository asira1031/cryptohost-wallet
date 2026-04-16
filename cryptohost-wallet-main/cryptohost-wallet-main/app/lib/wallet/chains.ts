import type { NetworkConfig, SupportedNetworkKey } from "../../types/wallet";

export const NETWORKS: Record<SupportedNetworkKey, NetworkConfig> = {
  ethereum: {
    key: "ethereum",
    label: "Ethereum",
    chainId: 1,
    symbol: "ETH",
    rpcUrl: process.env.NEXT_PUBLIC_ETH_RPC_URL || "",
    explorerTx: "https://etherscan.io/tx/",
    explorerAddress: "https://etherscan.io/address/",
  },
  bsc: {
    key: "bsc",
    label: "BNB Smart Chain",
    chainId: 56,
    symbol: "BNB",
    rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || "",
    explorerTx: "https://bscscan.com/tx/",
    explorerAddress: "https://bscscan.com/address/",
  },
  polygon: {
    key: "polygon",
    label: "Polygon",
    chainId: 137,
    symbol: "POL",
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "",
    explorerTx: "https://polygonscan.com/tx/",
    explorerAddress: "https://polygonscan.com/address/",
  },
};

export function getNetworkConfig(network: SupportedNetworkKey) {
  return NETWORKS[network];
}