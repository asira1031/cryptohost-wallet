// CryptoHost Authenticator v1 - TOTP Engine

const TIME_STEP = 30; // 30 seconds
const CODE_LENGTH = 6;

// Generate random secret (base32-like string)
export function generateAuthSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 16; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  return secret;
}

// Convert string to numeric hash
function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate current TOTP code
export function generateCurrentCode(secret: string): string {
  const time = Math.floor(Date.now() / 1000);
  const counter = Math.floor(time / TIME_STEP);

  const raw = `${secret}-${counter}`;
  const hash = simpleHash(raw);

  const code = (hash % 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, "0");

  return code;
}

// Verify user input code (allow small time drift)
export function verifyAuthCode(secret: string, inputCode: string): boolean {
  const time = Math.floor(Date.now() / 1000);

  for (let i = -1; i <= 1; i++) {
    const counter = Math.floor(time / TIME_STEP) + i;
    const raw = `${secret}-${counter}`;
    const hash = simpleHash(raw);
    const code = (hash % 10 ** CODE_LENGTH)
      .toString()
      .padStart(CODE_LENGTH, "0");

    if (code === inputCode) {
      return true;
    }
  }

  return false;
}

// Get seconds remaining before code refresh
export function getTimeRemaining(): number {
  const time = Math.floor(Date.now() / 1000);
  return TIME_STEP - (time % TIME_STEP);
}