export type EncryptedVaultPayload = {
  version: 1;
  address: string;
  cipherText: string;
  iv: string;
  salt: string;
  createdAt: string;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function ensureCrypto() {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    throw new Error("Secure crypto is not available in this browser.");
  }
}

function uint8ToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

function toBufferSource(bytes: Uint8Array): BufferSource {
  return uint8ToArrayBuffer(bytes);
}

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

function randomBytes(length: number): Uint8Array {
  ensureCrypto();
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return bytes;
}

async function deriveKey(passcode: string, saltBytes: Uint8Array): Promise<CryptoKey> {
  ensureCrypto();

  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(passcode),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toBufferSource(saltBytes),
      iterations: 250000,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptPrivateKey(
  privateKey: string,
  passcode: string,
  address: string
): Promise<EncryptedVaultPayload> {
  ensureCrypto();

  if (!privateKey || !passcode || !address) {
    throw new Error("Missing wallet encryption data.");
  }

  const saltBytes = randomBytes(16);
  const ivBytes = randomBytes(12);
  const key = await deriveKey(passcode, saltBytes);

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: toBufferSource(ivBytes),
    },
    key,
    encoder.encode(privateKey)
  );

  return {
    version: 1,
    address,
    cipherText: bufferToBase64(encrypted),
    iv: bufferToBase64(uint8ToArrayBuffer(ivBytes)),
    salt: bufferToBase64(uint8ToArrayBuffer(saltBytes)),
    createdAt: new Date().toISOString(),
  };
}

export async function decryptPrivateKey(
  payload: EncryptedVaultPayload,
  passcode: string
): Promise<string> {
  ensureCrypto();

  if (!payload?.cipherText || !payload?.iv || !payload?.salt) {
    throw new Error("Encrypted wallet data is incomplete.");
  }

  try {
    const saltBytes = new Uint8Array(base64ToArrayBuffer(payload.salt));
    const ivBytes = new Uint8Array(base64ToArrayBuffer(payload.iv));
    const encryptedData = base64ToArrayBuffer(payload.cipherText);
    const key = await deriveKey(passcode, saltBytes);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: toBufferSource(ivBytes),
      },
      key,
      encryptedData
    );

    return decoder.decode(decrypted);
  } catch {
    throw new Error("Invalid passcode. Please try again.");
  }
}