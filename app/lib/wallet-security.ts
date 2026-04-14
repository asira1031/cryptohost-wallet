const ENCRYPTED_WALLET_KEY = "cryptohost_encrypted_wallet";

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

async function deriveKey(password: string, salt: Uint8Array) {
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 250000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export type SecureWalletPayload = {
  address: string;
  privateKey: string;
};

export async function saveEncryptedWallet(
  payload: SecureWalletPayload,
  password: string
) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(JSON.stringify(payload))
  );

  const stored = {
    salt: bufferToBase64(salt.buffer),
    iv: bufferToBase64(iv.buffer),
    data: bufferToBase64(encrypted),
    address: payload.address,
  };

  localStorage.setItem(ENCRYPTED_WALLET_KEY, JSON.stringify(stored));
}

export async function unlockEncryptedWallet(password: string) {
  const raw = localStorage.getItem(ENCRYPTED_WALLET_KEY);
  if (!raw) {
    throw new Error("No encrypted wallet found.");
  }

  const parsed = JSON.parse(raw);
  const salt = new Uint8Array(base64ToBuffer(parsed.salt));
  const iv = new Uint8Array(base64ToBuffer(parsed.iv));
  const encryptedData = base64ToBuffer(parsed.data);

  const key = await deriveKey(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decrypted)) as SecureWalletPayload;
}

export function getEncryptedWalletAddress(): string | null {
  try {
    const raw = localStorage.getItem(ENCRYPTED_WALLET_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.address || null;
  } catch {
    return null;
  }
}

export function hasEncryptedWallet(): boolean {
  return !!localStorage.getItem(ENCRYPTED_WALLET_KEY);
}

export function clearEncryptedWallet() {
  localStorage.removeItem(ENCRYPTED_WALLET_KEY);
}