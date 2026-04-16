"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";

const USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

const rpcUrl =
  process.env.NEXT_PUBLIC_ETH_RPC_URL ||
  "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY_HERE";

const provider = new ethers.JsonRpcProvider(rpcUrl);

type SavedEncryptedWallet = {
  address: string;
  encryptedJson: string;
  createdAt: string;
};

export default function MyWalletPage() {
  const [savedWallet, setSavedWallet] = useState<SavedEncryptedWallet | null>(null);

  const [password, setPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [progress, setProgress] = useState(0);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockedAddress, setUnlockedAddress] = useState("");
  const [ethBalance, setEthBalance] = useState("0.0000");
  const [usdtBalance, setUsdtBalance] = useState("0.00");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cryptohost_encrypted_wallet");
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedEncryptedWallet;
      setSavedWallet(parsed);
    } catch (err) {
      console.error("Failed to load encrypted wallet:", err);
      setSavedWallet(null);
    }
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const shortAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const loadBalances = async (address: string) => {
    try {
      const ethWei = await provider.getBalance(address);
      setEthBalance(Number(ethers.formatEther(ethWei)).toFixed(4));

      const usdt = new ethers.Contract(USDT_CONTRACT, erc20Abi, provider);
      const rawUsdt = await usdt.balanceOf(address);
      const decimals = await usdt.decimals();

      setUsdtBalance(Number(ethers.formatUnits(rawUsdt, decimals)).toFixed(2));
    } catch (err) {
      console.error("Failed to load balances:", err);
      setEthBalance("0.0000");
      setUsdtBalance("0.00");
    }
  };

  const unlockWallet = async () => {
    try {
      clearMessages();

      if (!savedWallet?.encryptedJson) {
        setError("No encrypted wallet found.");
        return;
      }

      if (!password) {
        setError("Please enter your wallet password.");
        return;
      }

      setUnlocking(true);
      setProgress(0);

      const wallet = await ethers.Wallet.fromEncryptedJson(
        savedWallet.encryptedJson,
        password,
        (p) => setProgress(Math.round(p * 100))
      );

      setUnlockedAddress(wallet.address);
      setIsUnlocked(true);
      setSuccess("Wallet unlocked successfully.");

      await loadBalances(wallet.address);
    } catch (err: any) {
      console.error("Unlock wallet error:", err);
      setError(err?.message || "Failed to unlock wallet.");
      setIsUnlocked(false);
      setUnlockedAddress("");
    } finally {
      setUnlocking(false);
    }
  };

  const lockWallet = () => {
    setIsUnlocked(false);
    setUnlockedAddress("");
    setPassword("");
    setEthBalance("0.0000");
    setUsdtBalance("0.00");
    clearMessages();
    setSuccess("Wallet locked.");
  };

  const refreshBalances = async () => {
    clearMessages();

    const address = unlockedAddress || savedWallet?.address;
    if (!address) {
      setError("No wallet address found.");
      return;
    }

    await loadBalances(address);
    setSuccess("Balances refreshed.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#08152f] via-[#071229] to-[#030814] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">
            CryptoHost Wallet
          </p>
          <h1 className="mt-2 text-4xl font-bold">My Wallet</h1>
          <p className="mt-3 text-sm text-white/70 md:text-base">
            Unlock your encrypted standalone wallet with your password to view
            balances and prepare for sending.
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

          {!savedWallet ? (
            <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-5 text-sm text-yellow-100">
              No encrypted wallet found yet. Create a wallet first.
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/60">Saved Wallet Address</p>
                  <p className="mt-2 break-all text-sm text-white">
                    {savedWallet.address}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/60">Created At</p>
                  <p className="mt-2 text-sm text-white">
                    {new Date(savedWallet.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                <label className="mb-2 block text-sm text-white/70">
                  Wallet Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your wallet password"
                  className="w-full rounded-2xl border border-white/10 bg-[#0a1222] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
                />

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={unlockWallet}
                    disabled={unlocking}
                    className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-[#04101f] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {unlocking ? `Unlocking... ${progress}%` : "Unlock Wallet"}
                  </button>

                  <button
                    onClick={lockWallet}
                    className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Lock Wallet
                  </button>

                  <button
                    onClick={refreshBalances}
                    className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"
                  >
                    Refresh Balances
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/60">Status</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {isUnlocked ? "Unlocked" : "Locked"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/60">ETH Balance</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {ethBalance} ETH
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/60">USDT Balance</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {usdtBalance} USDT
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/60">Active Address</p>
                <p className="mt-2 break-all text-sm text-white">
                  {unlockedAddress || savedWallet.address}
                </p>
                <p className="mt-2 text-xs text-white/50">
                  {shortAddress(unlockedAddress || savedWallet.address)}
                </p>
              </div>
            </>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/create-wallet"
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Create Wallet
            </Link>

            <Link
              href="/dashboard"
              className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}