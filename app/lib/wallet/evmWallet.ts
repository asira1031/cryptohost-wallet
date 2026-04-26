import { ethers } from "ethers";

export type EvmWallet = {
  address: string;
  privateKey: string;
  mnemonic?: string;
};

const STORAGE_KEY = "cryptohost_evm_wallet";

function normalizeWallet(data: EvmWallet): EvmWallet {
  const wallet = new ethers.Wallet(data.privateKey);

  return {
    address: wallet.address,
    privateKey: data.privateKey,
    mnemonic: data.mnemonic || "",
  };
}

/**
 * 📥 Load existing wallet only.
 * Never creates a new wallet silently.
 */
export function loadEvmWallet(): EvmWallet | null {
  try {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as EvmWallet;

    if (!parsed.privateKey) return null;

    return normalizeWallet(parsed);
  } catch (err) {
    console.error("Wallet load error:", err);
    return null;
  }
}

/**
 * 🧾 Save/import wallet explicitly.
 * Use this only from Security / Import Wallet flow.
 */
export function saveEvmWallet(input: {
  privateKey: string;
  mnemonic?: string;
}): EvmWallet {
  if (typeof window === "undefined") {
    throw new Error("Wallet can only be saved in the browser.");
  }

  const wallet = new ethers.Wallet(input.privateKey);

  const data: EvmWallet = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: input.mnemonic || "",
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  return data;
}

/**
 * 🚫 No auto-create during send.
 */
export function getOrCreateEvmWallet(): EvmWallet {
  const existing = loadEvmWallet();

  if (!existing) {
    throw new Error("No EVM wallet loaded. Please import or create wallet from Security first.");
  }

  return existing;
}

/**
 * 🔓 Get signer for transactions.
 */
export function getEvmSigner(rpcUrl: string) {
  const wallet = loadEvmWallet();

  if (!wallet?.privateKey) {
    throw new Error("No wallet signing key found");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Wallet(wallet.privateKey, provider);
}

/**
 * 📤 Clear wallet only when user intentionally resets wallet.
 */
export function clearEvmWallet() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}