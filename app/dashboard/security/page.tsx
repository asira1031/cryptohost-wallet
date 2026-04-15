"use client";

import { useState } from "react";
import {
  clearEncryptedWallet,
  hasEncryptedWallet,
  unlockEncryptedWallet,
} from "@/app/lib/wallet-security";
import {
  generateAuthSecret,
  saveAuthSettings,
  loadAuthSettings,
  hashPin,
} from "@/app/lib/cryptohost-auth";

export default function SecurityPage() {
  const [message, setMessage] = useState("");

  // 🔐 backup states
  const [backupPassword, setBackupPassword] = useState("");
  const [revealedKey, setRevealedKey] = useState("");
  const [revealedMnemonic, setRevealedMnemonic] = useState("");
  const [backupError, setBackupError] = useState("");

  const handleClearWallet = () => {
    if (!window.confirm("Remove encrypted wallet from this device?")) return;
    clearEncryptedWallet();
    setMessage("Encrypted wallet removed from this device.");
  };

  // 🔐 reveal function
  const handleRevealBackup = async () => {
    try {
      setBackupError("");
      setRevealedKey("");
      setRevealedMnemonic("");

      if (!backupPassword.trim()) {
        setBackupError("Enter password to reveal backup.");
        return;
      }

      const unlocked = await unlockEncryptedWallet(backupPassword.trim());

      setRevealedKey((unlocked as any).privateKey || "");
      setRevealedMnemonic((unlocked as any).mnemonic || "");
    } catch (err) {
      setBackupError("Invalid password or no encrypted wallet found.");
    }
  };

  return (
    <div className="rounded-[22px] border border-white/10 bg-[#071923]/95 p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-300 via-pink-400 to-rose-500" />
        <div className="flex-1 rounded-full bg-white/5 px-4 py-2 text-[11px] text-white/35">
          Security settings
        </div>
        <div className="h-7 w-7 rounded-full bg-white/8" />
      </div>

      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/75">
          CryptoHost Wallet
        </p>
        <h1 className="mt-1 text-2xl font-bold">Security</h1>
        <p className="mt-2 text-sm text-white/60">
          Manage encrypted wallet data stored on this device.
        </p>
      </div>

      <div className="space-y-3">
        {/* STATUS */}
        <div className="rounded-[18px] border border-white/8 bg-[#091720] p-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
            Encrypted Wallet Status
          </p>
          <p className="mt-2 text-sm text-white/90">
            {hasEncryptedWallet()
              ? "Encrypted wallet found on this device."
              : "No encrypted wallet found on this device."}
          </p>
        </div>

        {/* INFO */}
        <div className="rounded-[18px] border border-white/8 bg-[#091720] p-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
            Device Security
          </p>
          <p className="mt-2 text-sm text-white/70">
            Your wallet is stored locally in encrypted form. Clearing it removes access from this browser.
          </p>
        </div>

        {/* 🔐 BACKUP SECTION */}
        <div className="rounded-[18px] border border-yellow-400/25 bg-yellow-500/10 p-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-yellow-200/80">
            Backup Recovery
          </p>

          <p className="mt-2 text-sm text-yellow-100/80">
            ⚠️ Save your private key and recovery phrase. If lost, funds cannot be recovered.
          </p>

          <input
            type="password"
            value={backupPassword}
            onChange={(e) => setBackupPassword(e.target.value)}
            placeholder="Enter wallet password"
            className="mt-3 w-full rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
          />

          <button
            type="button"
            onClick={handleRevealBackup}
            className="mt-3 w-full rounded-2xl border border-yellow-400/25 bg-yellow-500/15 px-4 py-3 text-sm font-semibold text-yellow-100"
          >
            Reveal Private Key & 12 Words
          </button>

          {backupError && (
            <div className="mt-3 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {backupError}
            </div>
          )}

          {revealedKey && (
            <div className="mt-3 rounded-2xl border border-white/8 bg-[#091720] p-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                Private Key
              </p>
              <p className="mt-2 break-all text-xs text-white/90">
                {revealedKey}
              </p>
            </div>
          )}

          {revealedMnemonic && (
            <div className="mt-3 rounded-2xl border border-white/8 bg-[#091720] p-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                Recovery Phrase
              </p>
              <p className="mt-2 text-xs text-white/90">
                {revealedMnemonic}
              </p>
            </div>
          )}
        </div>

        {/* DELETE */}
        <button
          type="button"
          onClick={handleClearWallet}
          className="w-full rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200"
        >
          Remove Encrypted Wallet
        </button>

        {message && (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}