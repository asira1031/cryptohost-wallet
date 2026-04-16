import type { SupportedNetworkKey } from "../../types/wallet";
import { getNetworkConfig } from "./chains";

export function getExplorerTxUrl(network: SupportedNetworkKey, hash: string) {
  return `${getNetworkConfig(network).explorerTx}${hash}`;
}

export function getExplorerAddressUrl(
  network: SupportedNetworkKey,
  address: string
) {
  return `${getNetworkConfig(network).explorerAddress}${address}`;
}