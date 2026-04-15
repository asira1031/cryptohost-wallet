export {
  generateAuthSecret,
  generateCurrentCode,
  verifyAuthCode,
  getTimeRemaining,
} from "./totp";

export {
  saveAuthSettings,
  loadAuthSettings,
  clearAuthSettings,
  isAuthEnabled,
  verifyPin,
  getStoredAuthSecret,
  hashPin,
} from "./storage";

export type { CryptoHostAuthSettings } from "./storage";