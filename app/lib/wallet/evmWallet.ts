import { ethers } from "ethers";

export type EvmWallet = {
  address: string;
  privateKey: string;
  mnemonic: string;
};

const STORAGE_KEY = "cryptohost_evm_wallet";

/**
 * 🔐 Create new wallet (only once)
 */
export function createEvmWallet(): EvmWallet {
  const wallet = ethers.Wallet.createRandom();

  const data: EvmWallet = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase || "",
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  return data;
}

/**
 * 📥 Load existing wallet
 */
export function loadEvmWallet(): EvmWallet | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    return JSON.parse(raw);
  } catch (err) {
    console.error("Wallet load error:", err);
    return null;
  }
}

/**
 * 🔄 Get or create wallet (SAFE ENTRY POINT)
 */
export function getOrCreateEvmWallet(): EvmWallet {
  const existing = loadEvmWallet();

  if (existing && existing.privateKey && existing.address) {
    return existing;
  }

  return createEvmWallet();
}

/**
 * 🔓 Get signer for transactions
 */
export function getEvmSigner(rpcUrl: string) {
  const wallet = loadEvmWallet();

  if (!wallet || !wallet.privateKey) {
    throw new Error("No wallet signing key found");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  return new ethers.Wallet(wallet.privateKey, provider);
}

/**
 * 📤 Clear wallet (for logout/reset)
 */
export function clearEvmWallet() {
  localStorage.removeItem(STORAGE_KEY);
}