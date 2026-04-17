export type StoredTronWallet = {
  address: string;
  hexAddress: string;
  privateKey: string;
  publicKey: string;
};

const TRON_WALLET_KEY = "cryptohost_tron_wallet";

export function saveTronWallet(wallet: StoredTronWallet) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TRON_WALLET_KEY, JSON.stringify(wallet));
}

export function getStoredTronWallet(): StoredTronWallet | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(TRON_WALLET_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredTronWallet;
  } catch {
    return null;
  }
}

export function clearStoredTronWallet() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TRON_WALLET_KEY);
}