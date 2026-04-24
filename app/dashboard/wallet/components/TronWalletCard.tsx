"use client";
import { generateTronWallet } from "@/app/lib/tron/wallet";
import { useEffect, useState } from "react";
import {
  getStoredTronWallet,
  saveTronWallet,
  clearStoredTronWallet,
  type StoredTronWallet,
} from "@/app/lib/tron/storage";

export default function TronWalletCard() {
  const [wallet, setWallet] = useState<StoredTronWallet | null>(null);
  const [trxBalance, setTrxBalance] = useState<number | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadBalances(address: string) {
  try {
    setLoading(true);

    // clear previous states (clean UI)
    setError("");
    setSuccess("");

    // fallback (safe mode / no API yet)
    setTrxBalance(0);
    setUsdtBalance(0);

    // optional: show clean status ONLY if may address
    if (address) {
      setSuccess("Wallet ready.");
    }

  } catch (err) {
    // minimal clean error (no technical noise)
    setError("Unable to load balance.");
  } finally {
    setLoading(false);
  }
}

  async function handleCreateWallet() {
    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const existing = getStoredTronWallet();
      if (existing) {
        setWallet(existing);
        await loadBalances(existing.address);
        setSuccess("Existing TRON wallet loaded.");
        return;
      }

      const newWallet = await generateTronWallet();

      const stored: StoredTronWallet = {
        address: newWallet.address,
        hexAddress: newWallet.hexAddress,
        privateKey: newWallet.privateKey,
        publicKey: newWallet.publicKey,
      };

      saveTronWallet(stored);
      setWallet(stored);
      await loadBalances(stored.address);
      setSuccess("TRON wallet created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
    } finally {
      setCreating(false);
    }
  }

  function handleRemoveWallet() {
    clearStoredTronWallet();
    setWallet(null);
    setTrxBalance(null);
    setUsdtBalance(null);
    setError("");
    setSuccess("");
  }

  async function handleRefresh() {
    if (!wallet?.address) return;
    await loadBalances(wallet.address);
  }

  async function copyToClipboard(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setSuccess(`${label} copied.`);
      setError("");
    } catch {
      setError(`Failed to copy ${label.toLowerCase()}.`);
    }
  }

  useEffect(() => {
    const existing = getStoredTronWallet();

    if (existing) {
      setWallet(existing);
      void loadBalances(existing.address);
    }
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">TRON Wallet (TRC20)</h2>

        <div className="flex gap-2">
          {!wallet ? (
            <button
              type="button"
              onClick={handleCreateWallet}
              disabled={creating}
              className="rounded-xl border border-cyan-400/25 bg-cyan-500/20 px-3 py-2 text-xs font-medium text-cyan-100 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create TRON Wallet"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={handleRemoveWallet}
                className="rounded-xl border border-red-400/25 bg-red-500/20 px-3 py-2 text-xs font-medium text-red-100"
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>

      {wallet ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-[#06131b] p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
              TRON Address
            </p>
            <p className="mt-2 break-all text-sm text-white/85">
              {wallet.address}
            </p>

            <button
              type="button"
              onClick={() => copyToClipboard(wallet.address, "Address")}
              className="mt-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white"
            >
              Copy Address
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-[#06131b] p-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                TRX Balance
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {trxBalance !== null ? trxBalance : "--"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#06131b] p-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                USDT (TRC20)
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {usdtBalance !== null ? usdtBalance : "--"}
              </p>
            </div>
          </div>

          

        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#06131b] p-4 text-sm text-white/75">
          No TRON wallet found yet. Click{" "}
          <span className="font-semibold text-white">Create TRON Wallet</span>{" "}
          to generate your TRON wallet.
        </div>
      )}

      {success ? (
        <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}