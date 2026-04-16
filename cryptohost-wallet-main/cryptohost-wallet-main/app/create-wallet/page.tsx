"use client";

import { useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";

type SavedEncryptedWallet = {
  address: string;
  encryptedJson: string;
  createdAt: string;
};

export default function CreateWalletPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [address, setAddress] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [encryptedJsonPreview, setEncryptedJsonPreview] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const validatePassword = () => {
    if (!password || !confirmPassword) {
      setError("Please enter and confirm your password.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }

    return true;
  };

  const createWallet = async () => {
    try {
      clearMessages();

      if (!validatePassword()) return;

      setLoading(true);
      setProgress(0);

      const wallet = ethers.Wallet.createRandom();
      const encryptedJson = await wallet.encrypt(password, (p) => {
        setProgress(Math.round(p * 100));
      });

      const payload: SavedEncryptedWallet = {
        address: wallet.address,
        encryptedJson,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("cryptohost_encrypted_wallet", JSON.stringify(payload));

      setAddress(wallet.address);
      setMnemonic(wallet.mnemonic?.phrase || "");
      setEncryptedJsonPreview(encryptedJson.slice(0, 120) + "...");
      setSuccess("Wallet created and encrypted successfully.");
    } catch (err: any) {
      console.error("Create wallet error:", err);
      setError(err?.message || "Failed to create wallet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#08152f] via-[#071229] to-[#030814] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">
            CryptoHost Wallet
          </p>
          <h1 className="mt-2 text-4xl font-bold">Create Standalone Wallet</h1>
          <p className="mt-3 text-sm text-white/70 md:text-base">
            This creates a new wallet, encrypts it with your password, and saves
            only the encrypted wallet file in your browser.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {success}
            </div>
          )}

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-white/70">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
              />
            </div>

            <button
              onClick={createWallet}
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-4 text-sm font-semibold text-[#04101f] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? `Encrypting... ${progress}%` : "Create Wallet"}
            </button>

            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
              Write down your secret recovery phrase and store it offline.
              Anyone with this phrase can control your funds.
            </div>
          </div>

          {address && (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/60">Wallet Address</p>
                <p className="mt-2 break-all text-sm text-white">{address}</p>
              </div>

              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
                <p className="text-sm font-semibold text-amber-200">
                  Secret Recovery Phrase
                </p>
                <p className="mt-2 break-words text-sm text-white">
                  {mnemonic || "No mnemonic available"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/60">Encrypted Wallet Preview</p>
                <p className="mt-2 break-all text-xs text-white/70">
                  {encryptedJsonPreview}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/my-wallet"
                  className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"
                >
                  Go to My Wallet
                </Link>

                <Link
                  href="/dashboard"
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}