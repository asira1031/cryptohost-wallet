"use client";

import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import {
  saveEncryptedWallet,
  unlockEncryptedWallet,
  hasEncryptedWallet,
  getEncryptedWalletAddress,
} from "@/app/lib/wallet-security";

const ETH_RPC_URL =
  process.env.NEXT_PUBLIC_ETH_RPC_URL ||
  "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY_HERE";

const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);

const USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

type TabKey = "send" | "receive";
type MarketChip = "tokens" | "perps" | "stocks";
type TxStatus = "pending" | "confirmed" | "failed";

type WalletTx = {
  id: string;
  walletAddress: string;
  txHash: string;
  token: string;
  amount: string;
  to: string;
  status: TxStatus;
  createdAt: string;
};

const TX_STORAGE_KEY = "cryptohost_wallet_tx_history";

function appendWalletTx(tx: WalletTx) {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(TX_STORAGE_KEY);
    const current = raw ? JSON.parse(raw) : [];
    const safeCurrent = Array.isArray(current) ? current : [];
    safeCurrent.unshift(tx);
    localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(safeCurrent));
  } catch (error) {
    console.error("Failed to save transaction history:", error);
  }
}

function shortenAddress(address?: string) {
  if (!address) return "No wallet";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function copyToClipboard(value: string) {
  if (typeof window === "undefined" || !value) return;
  navigator.clipboard.writeText(value).catch(() => {});
}

export default function StandaloneCWalletDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("send");
  const [marketChip, setMarketChip] = useState<MarketChip>("tokens");

  const [walletAddress, setWalletAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [ethBalance, setEthBalance] = useState("0.0000");
  const [usdtBalance, setUsdtBalance] = useState("0.00");
  const [usdtSymbol, setUsdtSymbol] = useState("USDT");

  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [recipient, setRecipient] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastTxHash, setLastTxHash] = useState("");

  const createWallet = async () => {
    try {
      setError("");
      setSuccess("");

      const cleanPassword = password.trim();
      if (!cleanPassword) {
        setError("Enter password first.");
        return;
      }

      const wallet = ethers.Wallet.createRandom();

      await saveEncryptedWallet(
        {
          address: wallet.address,
          privateKey: wallet.privateKey,
        },
        cleanPassword
      );

      setWalletAddress(wallet.address);
      setPrivateKey("");
      setIsUnlocked(false);
      setEthBalance("0.0000");
      setUsdtBalance("0.00");
      setSuccess("Wallet created securely! Unlock it to send transactions.");
    } catch (err) {
      console.error(err);
      setError("Failed to create wallet.");
    }
  };

  const loadWalletData = useCallback(async (addressOverride?: string) => {
    setLoadingBalances(true);
    setError("");

    try {
      const address = addressOverride || getEncryptedWalletAddress() || "";

      if (!address) {
        setWalletAddress("");
        setPrivateKey("");
        setEthBalance("0.0000");
        setUsdtBalance("0.00");
        return;
      }

      setWalletAddress(address);

      const usdtContract = new ethers.Contract(
        USDT_CONTRACT,
        erc20Abi,
        provider
      );

      const [ethRaw, usdtRaw, decimals, symbol] = await Promise.all([
        provider.getBalance(address),
        usdtContract.balanceOf(address),
        usdtContract.decimals(),
        usdtContract.symbol(),
      ]);

      setEthBalance(Number(ethers.formatEther(ethRaw)).toFixed(4));
      setUsdtBalance(Number(ethers.formatUnits(usdtRaw, decimals)).toFixed(2));
      setUsdtSymbol(symbol || "USDT");
    } catch (err) {
      console.error(err);
      setError("Failed to load wallet balances.");
    } finally {
      setLoadingBalances(false);
    }
  }, []);

  const unlockWallet = async () => {
    try {
      setError("");
      setSuccess("");

      const cleanPassword = password.trim();
      if (!cleanPassword) {
        setError("Enter your wallet password");
        return;
      }

      const unlocked = await unlockEncryptedWallet(cleanPassword);

      setWalletAddress(unlocked.address);
      setPrivateKey(unlocked.privateKey);
      setIsUnlocked(true);
      setSuccess("Wallet unlocked successfully!");

      await loadWalletData(unlocked.address);
    } catch (err: any) {
      console.error("UNLOCK ERROR:", err);
      setIsUnlocked(false);
      setPrivateKey("");
      setError("Wrong password or encrypted wallet not found.");
    }
  };

  useEffect(() => {
    if (hasEncryptedWallet()) {
      const address = getEncryptedWalletAddress();
      if (address) {
        setWalletAddress(address);
      }
    }
    loadWalletData();
  }, [loadWalletData]);

  const handleSendEth = async () => {
    setError("");
    setSuccess("");
    setLastTxHash("");

    try {
      if (!isUnlocked || !privateKey) {
        setError("Unlock wallet first.");
        return;
      }

      if (!walletAddress) {
        setError("No wallet loaded.");
        return;
      }

      if (!recipient.trim()) {
        setError("Please enter recipient address.");
        return;
      }

      if (!ethers.isAddress(recipient.trim())) {
        setError("Recipient address is invalid.");
        return;
      }

      if (!ethAmount.trim() || Number(ethAmount) <= 0) {
        setError("Please enter a valid ETH amount.");
        return;
      }

      let cleanedKey = privateKey.trim();
      if (!cleanedKey.startsWith("0x")) {
        cleanedKey = `0x${cleanedKey}`;
      }

      setSending(true);

      const signer = new ethers.Wallet(cleanedKey, provider);

      const tx = await signer.sendTransaction({
        to: recipient.trim(),
        value: ethers.parseEther(ethAmount),
      });

      setLastTxHash(tx.hash);

      appendWalletTx({
        id: `${Date.now()}-${tx.hash}`,
        walletAddress: signer.address,
        txHash: tx.hash,
        token: "ETH",
        amount: ethAmount,
        to: recipient.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      const receipt = await tx.wait();

      appendWalletTx({
        id: `${Date.now()}-${tx.hash}-final`,
        walletAddress: signer.address,
        txHash: tx.hash,
        token: "ETH",
        amount: ethAmount,
        to: recipient.trim(),
        status: receipt?.status === 1 ? "confirmed" : "failed",
        createdAt: new Date().toISOString(),
      });

      setSuccess("Transaction sent successfully!");
      setRecipient("");
      setEthAmount("");
      await loadWalletData(signer.address);
    } catch (err: any) {
      console.error(err);
      setError(err?.shortMessage || err?.message || "Transaction failed.");
    } finally {
      setSending(false);
    }
  };

  const estimatedUsd = useMemo(() => Number(usdtBalance || 0), [usdtBalance]);

  const liveCards = [
    { label: "ETH", color: "from-cyan-500/30 to-cyan-500/10" },
    { label: "BNB", color: "from-teal-500/30 to-teal-500/10" },
    { label: "SOL", color: "from-fuchsia-500/30 to-fuchsia-500/10" },
  ];

  const priceRows = [
    {
      symbol: "ETH",
      subtitle: "Live market price",
      value: ethBalance === "0.0000" ? "$0.00" : `${ethBalance} ETH`,
      change: "-0.85%",
    },
    {
      symbol: "USDT",
      subtitle: "Live market price",
      value: `$${formatUsd(estimatedUsd || 0)}`,
      change: "-0.02%",
    },
    {
      symbol: "BNB",
      subtitle: "Live market price",
      value: "$599.37",
      change: "0.14%",
    },
    {
      symbol: "SOL",
      subtitle: "Live market price",
      value: "$82.35",
      change: "-0.09%",
    },
  ];

  return (
    <div className="min-h-screen bg-[#02111f] px-3 py-2 text-white">
      <div className="mx-auto w-full max-w-[390px]">
        <div className="rounded-[30px] border border-cyan-500/20 bg-[radial-gradient(circle_at_top,#0c3340_0%,#071824_35%,#031019_100%)] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="mb-3 flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-medium text-white/90"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/wallet"
              className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-4 py-2 text-[11px] font-medium text-emerald-200"
            >
              Wallet
            </Link>
            <Link
              href="/dashboard/market"
              className="rounded-full border border-cyan-400/30 bg-cyan-500/20 px-4 py-2 text-[11px] font-medium text-cyan-200"
            >
              Market
            </Link>
            <Link
              href="/dashboard/history"
              className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/20 px-4 py-2 text-[11px] font-medium text-fuchsia-200"
            >
              History
            </Link>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-[#071923]/95 p-3">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-300 via-pink-400 to-rose-500" />
              <div className="flex-1 rounded-full bg-white/5 px-4 py-2 text-[11px] text-white/35">
                Search the app
              </div>
              <div className="h-7 w-7 rounded-full bg-white/8" />
            </div>

            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/75">
                  Markets • {shortenAddress(walletAddress)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => loadWalletData()}
                className="rounded-full border border-cyan-400/25 bg-cyan-500/15 px-3 py-1.5 text-[10px] font-semibold text-cyan-200"
              >
                {loadingBalances ? "Loading" : "Connected"}
              </button>
            </div>

            <div className="mb-3 space-y-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Wallet password"
                className="w-full rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={createWallet}
                  className="rounded-2xl border border-emerald-400/25 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-200"
                >
                  Create
                </button>

                <button
                  type="button"
                  onClick={unlockWallet}
                  className="rounded-2xl border border-cyan-400/25 bg-cyan-500/15 px-4 py-3 text-sm font-semibold text-cyan-200"
                >
                  Unlock
                </button>
              </div>
            </div>

            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setMarketChip("tokens")}
                className={`rounded-full px-4 py-2 text-[11px] font-medium ${
                  marketChip === "tokens"
                    ? "bg-white text-[#0d1a24]"
                    : "bg-white/8 text-white/70"
                }`}
              >
                Tokens
              </button>
              <button
                type="button"
                onClick={() => setMarketChip("perps")}
                className={`rounded-full px-4 py-2 text-[11px] font-medium ${
                  marketChip === "perps"
                    ? "bg-white text-[#0d1a24]"
                    : "bg-white/8 text-white/70"
                }`}
              >
                Perps
              </button>
              <button
                type="button"
                onClick={() => setMarketChip("stocks")}
                className={`rounded-full px-4 py-2 text-[11px] font-medium ${
                  marketChip === "stocks"
                    ? "bg-white text-[#0d1a24]"
                    : "bg-white/8 text-white/70"
                }`}
              >
                Stocks
              </button>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              {liveCards.map((card) => (
                <div
                  key={card.label}
                  className={`rounded-2xl border border-white/8 bg-gradient-to-br ${card.color} p-3`}
                >
                  <p className="text-[9px] uppercase tracking-[0.22em] text-cyan-200/80">
                    Live
                  </p>
                  <p className="mt-3 text-sm font-semibold">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="mb-2 flex items-center gap-3 px-1 text-[10px] font-medium text-white/55">
              <span>Favorites</span>
              <span className="text-white">Hot Picks</span>
              <span>All</span>
              <span>New</span>
            </div>

            <div className="space-y-2">
              {priceRows.map((row) => (
                <div
                  key={row.symbol}
                  className="rounded-[18px] border border-white/8 bg-[#091720] p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[15px] font-bold">{row.symbol}</p>
                      <p className="mt-1 text-[10px] text-white/45">{row.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-semibold">{row.value}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          row.change.startsWith("-")
                            ? "text-rose-300"
                            : "text-emerald-300"
                        }`}
                      >
                        {row.change}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[24px] border border-white/8 bg-[#0a1821] p-3">
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("send")}
                  className={`rounded-full px-4 py-2 text-xs font-medium ${
                    activeTab === "send"
                      ? "border border-cyan-400/30 bg-cyan-500/20 text-cyan-200"
                      : "border border-white/10 bg-white/10 text-white/75"
                  }`}
                >
                  Send
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("receive")}
                  className={`rounded-full px-4 py-2 text-xs font-medium ${
                    activeTab === "receive"
                      ? "border border-cyan-400/30 bg-cyan-500/20 text-cyan-200"
                      : "border border-white/10 bg-white/10 text-white/75"
                  }`}
                >
                  Receive
                </button>
              </div>

              {activeTab === "send" ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm text-white/65">
                      Recipient Address
                    </label>
                    <input
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="0x..."
                      className="w-full rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white/65">
                      ETH Amount
                    </label>
                    <input
                      value={ethAmount}
                      onChange={(e) => setEthAmount(e.target.value)}
                      placeholder="0.001"
                      className="w-full rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendEth}
                    disabled={sending}
                    className="w-full rounded-2xl border border-cyan-400/25 bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? "Sending..." : "Send ETH"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center rounded-[22px] bg-white p-4">
                    <QRCodeSVG value={walletAddress || "No wallet loaded"} size={180} />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#06131b] p-3">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                      Receive Address
                    </p>
                    <p className="mt-2 break-all text-sm text-white/85">
                      {walletAddress || "No wallet loaded"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(walletAddress)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white"
                  >
                    Copy Wallet Address
                  </button>
                </div>
              )}

              {(error || success || lastTxHash) && (
                <div className="mt-3 space-y-2">
                  {error ? (
                    <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </div>
                  ) : null}

                  {success ? (
                    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                      {success}
                    </div>
                  ) : null}

                  {lastTxHash ? (
                    <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
                      TX Hash: <span className="break-all font-mono">{lastTxHash}</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 rounded-full border border-white/8 bg-white/6 p-1.5 text-center">
              <Link
                href="/dashboard"
                className="rounded-full px-2 py-2 text-[10px] font-medium text-white/70"
              >
                Home
              </Link>
              <Link
                href="/dashboard/market"
                className="rounded-full bg-cyan-500/90 px-2 py-2 text-[10px] font-medium text-[#031019]"
              >
                Markets
              </Link>
              <Link
                href="/dashboard/history"
                className="rounded-full px-2 py-2 text-[10px] font-medium text-white/70"
              >
                Wallet
              </Link>
              <span className="rounded-full px-2 py-2 text-[10px] font-medium text-white/50">
                Secure
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}