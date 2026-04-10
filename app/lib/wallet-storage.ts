import type { EncryptedVaultPayload } from "@/app/lib/wallet-crypto";

export type LegacyWalletData = {
  address: string;
  privateKey: string;
};

const SECURE_VAULT_KEY = "cryptohost_secure_wallet_v1";
const LEGACY_ADDRESS_KEY = "cryptohost_wallet_address";
const LEGACY_PRIVATE_KEY_KEY = "cryptohost_wallet_private_key";
const LEGACY_OBJECT_KEY = "cryptohost_wallet";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredVault(): EncryptedVaultPayload | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(SECURE_VAULT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as EncryptedVaultPayload;
  } catch {
    return null;
  }
}

export function saveStoredVault(payload: EncryptedVaultPayload) {
  if (!isBrowser()) return;
  window.localStorage.setItem(SECURE_VAULT_KEY, JSON.stringify(payload));
}

export function clearStoredVault() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SECURE_VAULT_KEY);
}

export function getLegacyWalletData(): LegacyWalletData | null {
  if (!isBrowser()) return null;

  const address = window.localStorage.getItem(LEGACY_ADDRESS_KEY);
  const privateKey = window.localStorage.getItem(LEGACY_PRIVATE_KEY_KEY);

  if (address && privateKey) {
    return { address, privateKey };
  }

  const rawObject = window.localStorage.getItem(LEGACY_OBJECT_KEY);
  if (!rawObject) return null;

  try {
    const parsed = JSON.parse(rawObject) as Partial<LegacyWalletData>;
    if (parsed.address && parsed.privateKey) {
      return {
        address: parsed.address,
        privateKey: parsed.privateKey,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearLegacyWalletData() {
  if (!isBrowser()) return;

  window.localStorage.removeItem(LEGACY_ADDRESS_KEY);
  window.localStorage.removeItem(LEGACY_PRIVATE_KEY_KEY);
  window.localStorage.removeItem(LEGACY_OBJECT_KEY);
}