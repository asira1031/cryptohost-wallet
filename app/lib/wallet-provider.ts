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