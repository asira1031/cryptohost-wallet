"use client";

import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";

const ETH_RPC_URL =
  process.env.NEXT_PUBLIC_ETH_RPC_URL ||
  "https://eth-mainnet.g.alchemy.com/v2/gaZRkg_BK7Eou-s9f5Np";

const USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

type LocalWalletState = {
  address?: string;
  privateKey?: string;
  mnemonic?: string;
};

type PageKey = "home" | "wallet" | "markets" | "swap" | "security";

type MarketPriceMap = Record<
  string,
  {
    usd: number;
    usd_24h_change?: number;
  }
>;

function loadLocalWallet(): LocalWalletState | null {
  if (typeof window === "undefined") return null;

  const keys = [
    "cryptohost_full_wallet",
    "cryptohost_wallet",
    "wallet_data",
  ];

  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.address) return parsed;
    } catch {
      continue;
    }
  }

  return null;
}

function saveLocalWallet(wallet: LocalWalletState) {
  if (typeof window === "undefined") return;
  localStorage.setItem("cryptohost_full_wallet", JSON.stringify(wallet));
  localStorage.setItem("cryptohost_wallet", JSON.stringify(wallet));
  localStorage.setItem("wallet_data", JSON.stringify(wallet));
}

function clearLocalWallet() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cryptohost_full_wallet");
  localStorage.removeItem("cryptohost_wallet");
  localStorage.removeItem("wallet_data");
}

function shortAddress(address?: string) {
  if (!address) return "No wallet";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatUsd(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPrice(value?: number) {
  if (typeof value !== "number") return "$0.00";

  if (value >= 1000) {
    return formatUsd(value);
  }

  if (value >= 1) {
    return `$${value.toFixed(2)}`;
  }

  if (value >= 0.01) {
    return `$${value.toFixed(4)}`;
  }

  return `$${value.toFixed(6)}`;
}

function formatChange(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "+0.00%";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

const PAGES: PageKey[] = ["home", "wallet", "markets", "swap", "security"];

export default function StandaloneCWWalletDashboard() {
  const provider = useMemo(() => new ethers.JsonRpcProvider(ETH_RPC_URL), []);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const [page, setPage] = useState<PageKey>("wallet");

  const [marketPrices, setMarketPrices] = useState<MarketPriceMap>({});

  const [walletData, setWalletData] = useState<LocalWalletState | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [ethBalance, setEthBalance] = useState("0.000000");
  const [usdtBalance, setUsdtBalance] = useState("0.00");
  const [usdtSymbol, setUsdtSymbol] = useState("USDT");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [importing, setImporting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastTxHash, setLastTxHash] = useState("");

  const [importKey, setImportKey] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const [recipient, setRecipient] = useState("");
  const [ethAmount, setEthAmount] = useState("");

  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const [passcode, setPasscode] = useState("");
  const [passcodeSaved, setPasscodeSaved] = useState(false);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const fetchMarketPrices = useCallback(async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,binancecoin,solana&vs_currencies=usd&include_24hr_change=true",
        { cache: "no-store" }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch market prices");
      }

      const data = (await res.json()) as MarketPriceMap;
      setMarketPrices(data);
    } catch (err) {
      console.error("Market price fetch error:", err);
    }
  }, []);

  const refreshBalances = useCallback(
    async (address: string) => {
      if (!address) return;

      try {
        const ethWei = await provider.getBalance(address);
        const eth = Number(ethers.formatEther(ethWei)).toFixed(6);
        setEthBalance(eth);

        const token = new ethers.Contract(USDT_CONTRACT, ERC20_ABI, provider);

        const [rawBalance, decimals, symbol] = await Promise.all([
          token.balanceOf(address),
          token.decimals(),
          token.symbol(),
        ]);

        const formattedUsdt = Number(
          ethers.formatUnits(rawBalance, decimals)
        ).toFixed(2);

        setUsdtBalance(formattedUsdt);
        setUsdtSymbol(symbol || "USDT");
      } catch (err) {
        console.error("Balance refresh error:", err);
        setError("Unable to load wallet balances.");
      }
    },
    [provider]
  );

  useEffect(() => {
    const storedWallet = loadLocalWallet();

    if (storedWallet?.address) {
      setWalletData(storedWallet);
      setWalletAddress(storedWallet.address);
    }

    if (typeof window !== "undefined") {
      const savedPasscode = localStorage.getItem("cw_passcode") || "";
      if (savedPasscode) {
        setPasscode(savedPasscode);
        setPasscodeSaved(true);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMarketPrices();

    const interval = setInterval(() => {
      fetchMarketPrices();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchMarketPrices]);

  useEffect(() => {
    if (!walletAddress) {
      setEthBalance("0.000000");
      setUsdtBalance("0.00");
      return;
    }

    refreshBalances(walletAddress);
  }, [walletAddress, refreshBalances]);

  const ethBalanceNumber = Number(ethBalance || "0");
  const usdtBalanceNumber = Number(usdtBalance || "0");
  const estimatedUsd =
    ethBalanceNumber * (marketPrices.ethereum?.usd || 3200) + usdtBalanceNumber;

  const handleGenerateWallet = async () => {
    try {
      clearMessages();
      setGenerating(true);

      const newWallet = ethers.Wallet.createRandom();

      const walletToSave: LocalWalletState = {
        address: newWallet.address,
        privateKey: newWallet.privateKey,
        mnemonic: newWallet.mnemonic?.phrase || "",
      };

      saveLocalWallet(walletToSave);
      setWalletData(walletToSave);
      setWalletAddress(walletToSave.address || "");
      setImportKey("");
      setLastTxHash("");
      setSuccess("New wallet generated successfully.");
      setPage("wallet");
    } catch (err) {
      console.error(err);
      setError("Failed to generate wallet.");
    } finally {
      setGenerating(false);
    }
  };

  const handleImportWallet = async () => {
    try {
      clearMessages();

      if (!importKey.trim()) {
        setError("Please enter a private key.");
        return;
      }

      setImporting(true);

      let cleanedKey = importKey.trim();
      if (!cleanedKey.startsWith("0x")) {
        cleanedKey = `0x${cleanedKey}`;
      }

      const importedWallet = new ethers.Wallet(cleanedKey);

      const walletToSave: LocalWalletState = {
        address: importedWallet.address,
        privateKey: cleanedKey,
        mnemonic: "",
      };

      saveLocalWallet(walletToSave);
      setWalletData(walletToSave);
      setWalletAddress(walletToSave.address || "");
      setImportKey("");
      setLastTxHash("");
      setImportOpen(false);
      setSuccess("Wallet imported successfully.");
      setPage("wallet");
    } catch (err) {
      console.error(err);
      setError("Invalid private key.");
    } finally {
      setImporting(false);
    }
  };

  const handleDisconnect = () => {
    clearMessages();
    clearLocalWallet();
    setWalletData(null);
    setWalletAddress("");
    setEthBalance("0.000000");
    setUsdtBalance("0.00");
    setRecipient("");
    setEthAmount("");
    setImportKey("");
    setLastTxHash("");
    setSuccess("Wallet disconnected.");
  };

  const handleRefresh = async () => {
    try {
      clearMessages();

      if (!walletAddress) {
        setError("No wallet loaded.");
        return;
      }

      setLoading(true);
      await refreshBalances(walletAddress);
      await fetchMarketPrices();
      setSuccess("Balances refreshed.");
    } catch (err) {
      console.error(err);
      setError("Failed to refresh balances.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEth = async () => {
    try {
      clearMessages();

      if (!walletData?.privateKey) {
        setError("No private key found in local wallet.");
        return;
      }

      if (!recipient || !ethers.isAddress(recipient)) {
        setError("Invalid recipient address.");
        return;
      }

      if (!ethAmount || Number(ethAmount) <= 0) {
        setError("Enter a valid ETH amount.");
        return;
      }

      setSending(true);

      let cleanedKey = walletData.privateKey.trim();
      if (!cleanedKey.startsWith("0x")) {
        cleanedKey = `0x${cleanedKey}`;
      }

      const signer = new ethers.Wallet(cleanedKey, provider);

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(ethAmount),
      });

      await tx.wait();

      setLastTxHash(tx.hash);
      setRecipient("");
      setEthAmount("");
      setSendOpen(false);
      setSuccess("Transaction sent successfully.");

      await refreshBalances(signer.address);
    } catch (err: any) {
      console.error(err);
      setError(err?.reason || err?.message || "Transaction failed.");
    } finally {
      setSending(false);
    }
  };

  const handleSavePasscode = () => {
    clearMessages();

    if (passcode.length !== 6 || !/^\d{6}$/.test(passcode)) {
      setError("Passcode must be exactly 6 digits.");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("cw_passcode", passcode);
    }

    setPasscodeSaved(true);
    setSuccess("Passcode saved locally.");
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.changedTouches[0].clientX;

    if (touchStartX.current === null || touchEndX.current === null) return;

    const delta = touchStartX.current - touchEndX.current;
    const currentIndex = PAGES.indexOf(page);

    if (Math.abs(delta) < 40) return;

    if (delta > 0 && currentIndex < PAGES.length - 1) {
      setPage(PAGES[currentIndex + 1]);
    } else if (delta < 0 && currentIndex > 0) {
      setPage(PAGES[currentIndex - 1]);
    }
  };

  const ActionButton = ({
    label,
    onClick,
  }: {
    label: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="flex flex-1 items-center justify-center rounded-full bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
    >
      {label}
    </button>
  );

  const MessageBox = () =>
    error || success ? (
      <div className="mt-4 space-y-2">
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
      </div>
    ) : null;

  const pageTitle =
    page === "home"
      ? "Home"
      : page === "wallet"
      ? "Wallet"
      : page === "markets"
      ? "Markets"
      : page === "swap"
      ? "Swap"
      : "Security";

  const marketItems = [
    {
      name: "ETH",
      price: marketPrices.ethereum?.usd,
      change: marketPrices.ethereum?.usd_24h_change,
    },
    {
      name: "USDT",
      price: marketPrices.tether?.usd,
      change: marketPrices.tether?.usd_24h_change,
    },
    {
      name: "BNB",
      price: marketPrices.binancecoin?.usd,
      change: marketPrices.binancecoin?.usd_24h_change,
    },
    {
      name: "SOL",
      price: marketPrices.solana?.usd,
      change: marketPrices.solana?.usd_24h_change,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#073c44_0%,#04111a_34%,#02111f_100%)] px-3 py-4 text-white">
      <div className="mx-auto w-full max-w-[390px]">
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/75">
              CryptoHost Wallet
            </p>
            <h1 className="mt-1 text-xl font-bold">CW</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/90"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,26,28,0.95)_0%,rgba(6,18,25,0.97)_100%)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-orange-300 shadow-lg" />
            <div className="flex-1 px-3">
              <div className="rounded-full bg-white/8 px-4 py-2 text-sm text-white/45">
                Search the app
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/8" />
          </div>

          <div className="mb-4 flex items-center justify-between px-1">
            <div>
              <p className="text-sm text-white/55">
                {pageTitle}
                {walletAddress ? ` • ${shortAddress(walletAddress)}` : ""}
              </p>
            </div>
            <div className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-medium text-cyan-300">
              {walletAddress ? "Connected" : "Offline"}
            </div>
          </div>

          {page === "home" && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#1ef0ff_0%,#11d0f2_40%,#0aa6ea_100%)] p-5 text-slate-900">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-800/75">
                      Total wallet value
                    </p>
                    <h2 className="mt-3 text-4xl font-black">
                      {loading ? "$0.00" : formatUsd(estimatedUsd)}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-800/70">
                      ETH + {usdtSymbol} overview
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/25 px-3 py-2 text-right text-xs font-semibold">
                    CW
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] bg-[#072235] p-4 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/75">
                      Wallet card
                    </p>
                    <p className="text-[11px] text-white/60">Standalone</p>
                  </div>
                  <div className="mt-5 text-5xl font-black tracking-tight">
                    0 Fees
                  </div>
                  <div className="mt-4 text-sm text-white/70">
                    Add funds or receive crypto
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPage("wallet")}
                  className="rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900"
                >
                  Add funds
                </button>
                <button
                  onClick={() => setReceiveOpen(true)}
                  className="rounded-full bg-white/8 px-4 py-3 text-sm font-semibold text-white"
                >
                  Receive
                </button>
              </div>

              <div className="rounded-[28px] bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <button className="rounded-full bg-white/8 px-4 py-2 text-sm text-white">
                    QR pay
                  </button>
                  <button className="rounded-full bg-white/8 px-4 py-2 text-sm text-white">
                    Card
                  </button>
                  <button className="rounded-full bg-white/8 px-4 py-2 text-sm text-white">
                    Transfer
                  </button>
                </div>

                <div className="rounded-[24px] bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold">QR pay</p>
                      <p className="mt-1 text-sm text-white/55">
                        No verification needed, with competitive rates
                      </p>
                    </div>
                    <button className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-900">
                      Scan
                    </button>
                  </div>
                </div>
              </div>

              <MessageBox />
            </div>
          )}

                    {page === "wallet" && (
            <div className="space-y-4">
              <div className="rounded-[32px] bg-[linear-gradient(135deg,#20e9ff_0%,#1bc9ff_32%,#1876ff_100%)] p-5 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/80">
                      Total Balance
                    </p>
                    <h2 className="mt-3 text-4xl font-black leading-none">
                      {loading ? "Loading..." : `${ethBalance} ETH`}
                    </h2>
                    <p className="mt-2 text-sm text-white/85">
                      {usdtBalance} {usdtSymbol}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 px-3 py-2 text-right text-[11px] text-white/90">
                    <div>Status</div>
                    <div className="mt-1 font-semibold">
                      {walletAddress ? "Connected" : "No Wallet"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[22px] bg-black/20 p-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/75">
                    Wallet Address
                  </p>
                  <p className="mt-2 break-all text-sm font-medium">
                    {walletAddress || "No wallet loaded yet"}
                  </p>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleRefresh}
                    className="flex-1 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex-1 rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGenerateWallet}
                  disabled={generating}
                  className="flex-1 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-60"
                >
                  {generating ? "Generating..." : "Generate Wallet"}
                </button>
                <button
                  onClick={() => setImportOpen((prev) => !prev)}
                  className="flex-1 rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                >
                  Import Wallet
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <ActionButton
                  label="Send"
                  onClick={() => {
                    setSendOpen(true);
                    setReceiveOpen(false);
                    setHistoryOpen(false);
                  }}
                />
                <ActionButton
                  label="Receive"
                  onClick={() => {
                    setReceiveOpen(true);
                    setSendOpen(false);
                    setHistoryOpen(false);
                  }}
                />
                <ActionButton
                  label="History"
                  onClick={() => {
                    setHistoryOpen(true);
                    setSendOpen(false);
                    setReceiveOpen(false);
                  }}
                />
              </div>

              {importOpen && (
                <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Import Private Key</h3>
                    <button
                      onClick={() => setShowPrivateKey((prev) => !prev)}
                      className="text-xs text-cyan-300"
                    >
                      {showPrivateKey ? "Hide" : "Show"}
                    </button>
                  </div>

                  <textarea
                    value={importKey}
                    onChange={(e) => setImportKey(e.target.value)}
                    placeholder="Paste private key here"
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-[#101d31] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-white/55">
                      Current wallet: {shortAddress(walletAddress)}
                    </p>
                    <button
                      onClick={handleImportWallet}
                      disabled={importing}
                      className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
                    >
                      {importing ? "Importing..." : "Import"}
                    </button>
                  </div>

                  {walletData?.privateKey && showPrivateKey && (
                    <div className="mt-3 rounded-2xl bg-cyan-400/10 p-3">
                      <p className="text-xs text-cyan-200/80">
                        Stored Private Key
                      </p>
                      <p className="mt-1 break-all text-xs text-white/85">
                        {walletData.privateKey}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {sendOpen && (
                <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-semibold">Send ETH</h3>

                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="Recipient wallet address"
                      className="w-full rounded-2xl border border-white/10 bg-[#101d31] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                    />

                    <input
                      type="number"
                      step="0.000001"
                      value={ethAmount}
                      onChange={(e) => setEthAmount(e.target.value)}
                      placeholder="Amount in ETH"
                      className="w-full rounded-2xl border border-white/10 bg-[#101d31] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                    />

                    <button
                      onClick={handleSendEth}
                      disabled={sending || !walletAddress}
                      className="w-full rounded-full bg-cyan-400 px-4 py-3 font-semibold text-slate-900 disabled:opacity-60"
                    >
                      {sending ? "Sending..." : "Send ETH"}
                    </button>
                  </div>
                </div>
              )}

              {receiveOpen && (
                <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-semibold">Receive</h3>
                  <p className="mt-2 text-sm text-white/65">
                    Use this address to receive ETH or ERC-20 tokens.
                  </p>

                  <div className="mt-4 flex flex-col items-center rounded-2xl bg-[#101d31] p-4">
                    {walletAddress ? (
                      <>
                        <div className="rounded-2xl bg-white p-3">
                          <QRCodeSVG
                            value={walletAddress}
                            size={180}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                            includeMargin={true}
                          />
                        </div>

                        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/45">
                          Wallet Address
                        </p>

                        <p className="mt-2 break-all text-center text-sm text-white">
                          {walletAddress}
                        </p>

                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(walletAddress);
                              clearMessages();
                              setSuccess("Wallet address copied.");
                            } catch {
                              clearMessages();
                              setError("Failed to copy wallet address.");
                            }
                          }}
                          className="mt-4 rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-900"
                        >
                          Copy Address
                        </button>
                      </>
                    ) : (
                      <p className="text-sm text-white/65">No wallet loaded</p>
                    )}
                  </div>
                </div>
              )}

              {historyOpen && (
                <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-semibold">History</h3>

                  {lastTxHash ? (
                    <div className="mt-3 rounded-2xl bg-[#101d31] p-4">
                      <p className="text-xs text-white/55">Last transaction</p>
                      <p className="mt-2 break-all text-sm text-white/90">
                        {lastTxHash}
                      </p>
                      <a
                        href={`https://etherscan.io/tx/${lastTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-sm font-medium text-cyan-300"
                      >
                        View on Etherscan
                      </a>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-2xl bg-[#101d31] p-4 text-sm text-white/65">
                      No transaction yet.
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Assets</h3>
                  <button className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/70">
                    Tokens
                  </button>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Chain Status</h3>
                    <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-300">
                      Multi-chain
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "ETH", status: "ready" },
                      { name: "BNB", status: "ready" },
                      { name: "Arbitrum", status: "ready" },
                    ].map((chain) => (
                      <div
                        key={chain.name}
                        className="flex items-center justify-between rounded-2xl bg-[#101d31] px-4 py-4"
                      >
                        <div>
                          <p className="text-sm font-semibold">{chain.name}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-emerald-400 text-xs font-bold text-slate-950">
                            ✓
                          </span>
                          <span className="text-sm text-white/85">
                            {chain.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-[#101d31] px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold">Ethereum</p>
                      <p className="text-xs text-white/55">Native asset</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{ethBalance} ETH</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#101d31] px-4 py-4">
  <div>
    <p className="text-sm font-semibold">EURC</p>
    <p className="text-xs text-white/55">Stablecoin</p>
  </div>
  <div className="text-right">
    <p className="text-sm font-semibold">0.00</p>
  </div>
</div>

                  <div className="flex items-center justify-between rounded-2xl bg-[#101d31] px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold">{usdtSymbol}</p>
                      <p className="text-xs text-white/55">ERC-20 token</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{usdtBalance}</p>
                    </div>
                  </div>
                </div>
              </div>

              <MessageBox />
            </div>
          )}

          {page === "markets" && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <button className="rounded-full bg-white/8 px-4 py-2 text-sm text-white">
                  Tokens
                </button>
                <button className="rounded-full px-4 py-2 text-sm text-white/60">
                  Perps
                </button>
                <button className="rounded-full px-4 py-2 text-sm text-white/60">
                  Stocks
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-cyan-500/15 p-3">
                  <p className="text-xs text-cyan-300">Live</p>
                  <p className="mt-2 text-sm font-semibold">ETH</p>
                </div>
                <div className="rounded-2xl bg-cyan-500/15 p-3">
                  <p className="text-xs text-cyan-300">Live</p>
                  <p className="mt-2 text-sm font-semibold">BNB</p>
                </div>
                <div className="rounded-2xl bg-pink-500/15 p-3">
                  <p className="text-xs text-pink-300">Live</p>
                  <p className="mt-2 text-sm font-semibold">SOL</p>
                </div>
              </div>

              <div className="flex gap-3 text-sm">
                <button className="text-white/60">Favorites</button>
                <button className="font-semibold text-white">Hot Picks</button>
                <button className="text-white/60">All</button>
                <button className="text-white/60">New</button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: "ETH",
                    price: marketPrices.ethereum?.usd ?? 0,
                    change: marketPrices.ethereum?.usd_24h_change ?? 0,
                  },
                  {
                    name: "USDT",
                    price: marketPrices.tether?.usd ?? 0,
                    change: marketPrices.tether?.usd_24h_change ?? 0,
                  },
                  {
                    name: "BNB",
                    price: marketPrices.binancecoin?.usd ?? 0,
                    change: marketPrices.binancecoin?.usd_24h_change ?? 0,
                  },
                  {
                    name: "SOL",
                    price: marketPrices.solana?.usd ?? 0,
                    change: marketPrices.solana?.usd_24h_change ?? 0,
                  },
                ].map((coin) => (
                  <div
                    key={coin.name}
                    className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-4"
                  >
                    <div>
                      <p className="text-base font-semibold">{coin.name}</p>
                      <p className="text-xs text-white/45">Live market price</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold">
                        {formatUsd(coin.price)}
                      </p>
                      <p
                        className={`text-xs ${
                          coin.change < 0 ? "text-pink-300" : "text-cyan-300"
                        }`}
                      >
                        {coin.change.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <MessageBox />
            </div>
          )}

          {page === "swap" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Swap + Bridge</h2>
                <div className="flex gap-2">
                  <div className="h-10 w-10 rounded-full bg-white/8" />
                  <div className="h-10 w-10 rounded-full bg-white/8" />
                </div>
              </div>

              <div className="rounded-[28px] bg-white/5 p-4">
                <div className="rounded-[24px] bg-white/5 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-4xl font-bold">0</p>
                      <p className="mt-1 text-sm text-white/45">$0.00</p>
                    </div>
                    <div className="rounded-full bg-white/8 px-4 py-2 text-sm">
                      ETH
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-white/45">
                    Available: {ethBalance} ETH
                  </p>
                </div>

                <div className="relative mx-auto my-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#0e1b21]">
                  <div className="text-xl text-white/70">↕</div>
                </div>

                <div className="rounded-[24px] bg-white/5 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-4xl font-bold">0</p>
                      <p className="mt-1 text-sm text-white/45">$0.00</p>
                    </div>
                    <div className="rounded-full bg-white/8 px-4 py-2 text-sm">
                      {usdtSymbol}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-white/45">
                    Available: {usdtBalance} {usdtSymbol}
                  </p>
                </div>

                <button className="mt-4 w-full rounded-full bg-cyan-400 px-4 py-4 text-base font-semibold text-slate-900">
                  Deposit now
                </button>
              </div>

              <MessageBox />
            </div>
          )}

          {page === "security" && (
            <div className="flex min-h-[620px] flex-col justify-between">
              <div>
                <div className="pt-10 text-center">
                  <h2 className="text-5xl font-black">Set passcode</h2>
                  <p className="mx-auto mt-4 max-w-[260px] text-lg leading-relaxed text-white/65">
                    For security verification only. Bitget Wallet never stores
                    your passcode.
                  </p>
                  <p className="mt-2 text-lg font-medium text-amber-300">
                    Please remember your passcode.
                  </p>
                </div>

                <div className="mt-12 flex items-center justify-center gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-14 w-10 rounded-lg border ${
                        i < passcode.length
                          ? "border-cyan-300 bg-cyan-300/15"
                          : "border-white/10 bg-white/5"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pb-6">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={passcode}
                  onChange={(e) =>
                    setPasscode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit passcode"
                  className="mb-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-xl tracking-[0.4em] text-white outline-none placeholder:tracking-normal placeholder:text-white/30"
                />

                <button
                  onClick={handleSavePasscode}
                  className="w-full rounded-full bg-cyan-400 px-4 py-4 text-lg font-semibold text-slate-900"
                >
                  Save Passcode
                </button>

                {passcodeSaved ? (
                  <p className="mt-4 text-center text-sm text-emerald-300">
                    Passcode saved locally.
                  </p>
                ) : null}

                <div className="mt-8 grid grid-cols-3 gap-y-4 px-6 text-center text-3xl">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
                    (key, index) => (
                      <button
                        key={`${key}-${index}`}
                        type="button"
                        onClick={() => {
                          if (!key) return;
                          if (key === "⌫") {
                            setPasscode((prev) => prev.slice(0, -1));
                            return;
                          }
                          setPasscode((prev) =>
                            `${prev}${key}`.replace(/\D/g, "").slice(0, 6)
                          );
                        }}
                        className="py-3"
                      >
                        {key}
                      </button>
                    )
                  )}
                </div>

                <MessageBox />
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between rounded-full bg-white/10 px-3 py-2 backdrop-blur">
            {[
              { key: "home", label: "Home" },
              { key: "markets", label: "Markets" },
              { key: "swap", label: "Swap" },
              { key: "wallet", label: "Wallet" },
              { key: "security", label: "Secure" },
            ].map((item) => {
              const active = page === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setPage(item.key as PageKey)}
                  className={`rounded-full px-4 py-3 text-xs font-medium transition ${
                    active
                      ? "bg-cyan-400 text-slate-900"
                      : "text-white/65 hover:bg-white/8"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-center text-[11px] text-white/35">
            Swipe left or right to move page • CryptoHost Wallet
          </div>
        </div>
      </div>
    </div>
  );
}