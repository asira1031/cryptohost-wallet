"use client";

import { useState } from "react";
import { clearEncryptedWallet, hasEncryptedWallet } from "@/app/lib/wallet-security";

export default function SecurityPage() {
  const [message, setMessage] = useState("");

  const handleClearWallet = () => {
    if (!window.confirm("Remove encrypted wallet from this device?")) return;
    clearEncryptedWallet();
    setMessage("Encrypted wallet removed from this device.");
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

        <div className="rounded-[18px] border border-white/8 bg-[#091720] p-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
            Device Security
          </p>
          <p className="mt-2 text-sm text-white/70">
            Your wallet is stored locally in encrypted form. Clearing it removes access from this browser.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearWallet}
          className="w-full rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200"
        >
          Remove Encrypted Wallet
        </button>

        {message ? (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}