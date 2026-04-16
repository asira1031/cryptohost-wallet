// CryptoHost Authenticator v1 - Storage

export type CryptoHostAuthSettings = {
  authEnabled: boolean;
  authSecret: string;
  pinHash: string;
  createdAt: string;
};

const STORAGE_KEY = "cryptohost_auth_settings";

// Very simple hash for v1 local protection.
// Later we can upgrade this to Web Crypto.
export function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    hash = (hash << 5) - hash + pin.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash));
}

export function saveAuthSettings(settings: CryptoHostAuthSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function loadAuthSettings(): CryptoHostAuthSettings | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CryptoHostAuthSettings;
  } catch {
    return null;
  }
}

export function clearAuthSettings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function isAuthEnabled(): boolean {
  const settings = loadAuthSettings();
  return !!settings?.authEnabled;
}

export function verifyPin(inputPin: string): boolean {
  const settings = loadAuthSettings();
  if (!settings) return false;

  return hashPin(inputPin) === settings.pinHash;
}

export function getStoredAuthSecret(): string {
  const settings = loadAuthSettings();
  return settings?.authSecret || "";
}