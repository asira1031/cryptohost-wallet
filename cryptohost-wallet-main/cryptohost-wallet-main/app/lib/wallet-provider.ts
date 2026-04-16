// app/lib/wallet-provider.ts

import { ethers } from "ethers";
import { DEFAULT_ETH_RPC } from "./wallet-config";

// 🔗 clean RPC (handles bad env like "=https://...")
const RAW_RPC =
  process.env.NEXT_PUBLIC_ETH_RPC_URL || DEFAULT_ETH_RPC;

export const ETH_RPC_URL = RAW_RPC.trim()
  .replace(/^=+/, "")
  .replace(/^['"]|['"]$/g, "");

// ⚡ shared provider
export const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
const BNB_RPC_URL =
  process.env.NEXT_PUBLIC_BNB_RPC_URL ||
  "https://bsc-dataseed.binance.org/";

export const getProvider = (asset: "ETH" | "USDT" | "BNB") => {
  if (asset === "BNB") {
    return new ethers.JsonRpcProvider(BNB_RPC_URL);
  }

  return provider; // use your existing ETH provider
};