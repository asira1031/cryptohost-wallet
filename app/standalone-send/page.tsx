"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";

const USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const usdtAbi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 value) returns (bool)",
];

const rpcUrl =
  process.env.NEXT_PUBLIC_ETH_RPC_URL ||
  "https://eth-mainnet.g.alchemy.com/v2/gaZRkg_BK7Eou-s9f5NpV";

const provider = new ethers.JsonRpcProvider(rpcUrl);

type SavedEncryptedWallet = {
  address: string;
  encryptedJson: string;
  createdAt: string;
};

type SendMode = "eth" | "usdt";

export default function StandaloneSendPage() {
  const [savedWallet, setSavedWallet] = useState<SavedEncryptedWallet | null>(null);

  const [password, setPassword] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<SendMode>("eth");

  const [ethBalance, setEthBalance] = useState("0.0000");
  const [usdtBalance, setUsdtBalance] = useState("0.00");

  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [progress, setProgress] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [txHash, setTxHash] = useState("");

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
    setTxHash("");
  };

  const validateRecipient = (address: string) => {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  };

  const loadBalances = async (address: string) => {
    try {
      const ethWei = await provider.getBalance(address);
      setEthBalance(Number(ethers.formatEther(ethWei)).toFixed(4));

      const usdt = new ethers.Contract(USDT_CONTRACT, usdtAbi, provider);
      const rawUsdt = await usdt.balanceOf(address);
      const decimals = await usdt.decimals();

      setUsdtBalance(Number(ethers.formatUnits(rawUsdt, decimals)).toFixed(2));
    } catch (err) {
      console.error("Failed to load balances:", err);
      setEthBalance("0.0000");
      setUsdtBalance("0.00");
    }
  };

  const refreshBalances = async () => {
    if (!savedWallet?.address) {
      setError("No wallet found.");
      return;
    }

    clearMessages();
    await loadBalances(savedWallet.address);
    setSuccess("Balances refreshed.");
  };

  const sendAsset = async () => {
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

      if (!validateRecipient(recipient)) {
        setError("Please enter a valid recipient address.");
        return;
      }

      if (!amount || Number(amount) <= 0) {
        setError(`Please enter a valid ${mode.toUpperCase()} amount.`);
        return;
      }

      setLoading(true);
      setUnlocking(true);
      setProgress(0);

      const wallet = await ethers.Wallet.fromEncryptedJson(
        savedWallet.encryptedJson,
        password,
        (p) => setProgress(Math.round(p * 100))
      );

      const signer = wallet.connect(provider);

      setUnlocking(false);

      if (mode === "eth") {
        const tx = await signer.sendTransaction({
          to: recipient,
          value: ethers.parseEther(amount),
        });

        setTxHash(tx.hash);
        setSuccess(`ETH transaction submitted: ${tx.hash}`);

        await tx.wait();
      } else {
        const usdt = new ethers.Contract(USDT_CONTRACT, usdtAbi, signer);
        const decimals = await usdt.decimals();
        const parsedAmount = ethers.parseUnits(amount, decimals);

        const tx = await usdt.transfer(recipient, parsedAmount);

        setTxHash(tx.hash);
        setSuccess(`USDT transaction submitted: ${tx.hash}`);

        await tx.wait();
      }

      await loadBalances(savedWallet.address);
      setAmount("");
    } catch (err: any) {
      console.error("Standalone send error:", err);
      setError(err?.reason || err?.message || "Failed to send transaction.");
    } finally {
      setLoading(false);
      setUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#08152f] via-[#071229] to-[#030814] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">
            CryptoHost Wallet
          </p>
          <h1 className="mt-2 text-4xl font-bold">Standalone Send</h1>
          <p className="mt-3 text-sm text-white/70 md:text-base">
            Send ETH or USDT directly from your encrypted wallet without connecting
            Trust Wallet or MetaMask.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 break-all rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {success}
            </div>
          )}

          {!savedWallet ? (
            <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-5 text-sm text-yellow-100">
              No encrypted wallet found. Create a wallet first.
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/60">Wallet Address</p>
                  <p className="mt-2 break-all text-sm text-white">
                    {savedWallet.address}
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

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 space-y-4">
                <div>
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
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Asset
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMode("eth")}
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition border ${
                        mode === "eth"
                          ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
                          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      ETH
                    </button>

                    <button
                      onClick={() => setMode("usdt")}
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition border ${
                        mode === "usdt"
                          ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
                          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      USDT
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="w-full rounded-2xl border border-white/10 bg-[#0a1222] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Amount ({mode.toUpperCase()})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={mode === "eth" ? "0.001" : "10"}
                    className="w-full rounded-2xl border border-white/10 bg-[#0a1222] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={sendAsset}
                    disabled={loading}
                    className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-[#04101f] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? unlocking
                        ? `Unlocking... ${progress}%`
                        : `Sending ${mode.toUpperCase()}...`
                      : `Send ${mode.toUpperCase()}`}
                  </button>

                  <button
                    onClick={refreshBalances}
                    className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"
                  >
                    Refresh Balances
                  </button>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0a1222] p-4 text-sm text-white/70">
                  ETH sends require enough ETH balance. USDT sends also require ETH for gas.
                </div>

                {txHash && (
                  <a
                    href={`https://etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block break-all rounded-2xl border border-emerald-400/15 bg-emerald-500/10 p-4 text-sm text-emerald-200 hover:bg-emerald-500/15"
                  >
                    View transaction on Etherscan: {txHash}
                  </a>
                )}
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
              href="/my-wallet"
              className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
            >
              My Wallet
            </Link>

            <Link
              href="/dashboard"
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}