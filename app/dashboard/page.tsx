"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const usdtAbi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 value) returns (bool)",
];

const rpcUrl =
  process.env.NEXT_PUBLIC_ETH_RPC_URL ||
  "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY_HERE";

const provider = new ethers.JsonRpcProvider(rpcUrl);

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

type WalletState = {
  address: string;
  shortAddress: string;
  ethBalance: string;
  usdtBalance: string;
  network: string;
  chainId: string;
  isConnected: boolean;
};

type ActionTab = "send" | "receive" | "buy" | "sell" | "swap";

function WalletLogo() {
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1 shadow-lg md:h-20 md:w-20">
      <Image
        src="/cryptohost-logo.jpeg"
        alt="CryptoHost Logo"
        fill
        className="object-contain p-1"
        priority
      />
    </div>
  );
}

export default function DashboardPage() {
  const [wallet, setWallet] = useState<WalletState>({
    address: "",
    shortAddress: "",
    ethBalance: "0.0000",
    usdtBalance: "0.00",
    network: "-",
    chainId: "-",
    isConnected: false,
  });

  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingWallet, setCheckingWallet] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [localWallet, setLocalWallet] = useState<any>(null);
  const [standaloneEthBalance, setStandaloneEthBalance] = useState("0.0000");
  const [standaloneUsdtBalance, setStandaloneUsdtBalance] = useState("0.00");
  const [standaloneLoading, setStandaloneLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<"external" | "standalone" | "none">("none");

  const [recipient, setRecipient] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");

  const [sendingEth, setSendingEth] = useState(false);
  const [sendingUsdt, setSendingUsdt] = useState(false);
  const [lastTxHash, setLastTxHash] = useState("");

  const [activeTab, setActiveTab] = useState<ActionTab>("send");

  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkLabel = (chainId: bigint | number) => {
    const id = Number(chainId);

    switch (id) {
      case 1:
        return "Ethereum Mainnet";
      case 56:
        return "BNB Smart Chain";
      case 137:
        return "Polygon";
      case 11155111:
        return "Sepolia";
      default:
        return `Unknown Network (${id})`;
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const resetWalletState = () => {
    setWallet({
      address: "",
      shortAddress: "",
      ethBalance: "0.0000",
      usdtBalance: "0.00",
      network: "-",
      chainId: "-",
      isConnected: false,
    });
  };

  const explorerBaseUrl = useMemo(() => {
    if (wallet.chainId === "1") return "https://etherscan.io/tx/";
    if (wallet.chainId === "11155111") return "https://sepolia.etherscan.io/tx/";
    if (wallet.chainId === "56") return "https://bscscan.com/tx/";
    if (wallet.chainId === "137") return "https://polygonscan.com/tx/";
    return "";
  }, [wallet.chainId]);

  const readWalletData = useCallback(async () => {
    try {
      if (!window.ethereum) {
        resetWalletState();
        return;
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_accounts", []);

      if (!accounts || accounts.length === 0) {
        resetWalletState();
        return;
      }

      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();
      const balanceWei = await browserProvider.getBalance(address);
      const network = await browserProvider.getNetwork();

      let usdtBalance = "0.00";

      if (Number(network.chainId) === 1) {
        const usdtContract = new ethers.Contract(
          USDT_CONTRACT,
          usdtAbi,
          browserProvider
        );

        const usdtRaw = await usdtContract.balanceOf(address);
        const usdtDecimals = await usdtContract.decimals();

        usdtBalance = Number(
          ethers.formatUnits(usdtRaw, usdtDecimals)
        ).toFixed(2);
      }

      setWallet({
        address,
        shortAddress: shortenAddress(address),
        ethBalance: Number(ethers.formatEther(balanceWei)).toFixed(4),
        usdtBalance,
        network: getNetworkLabel(network.chainId),
        chainId: network.chainId.toString(),
        isConnected: true,
      });

      setError("");
    } catch (err: any) {
      console.error("Wallet read error:", err);
      setError(err?.message || "Failed to read wallet data.");
      resetWalletState();
    }
  }, []);

  useEffect(() => {
    try {
      const raw =
  localStorage.getItem("cryptohost_full_wallet") ||
  localStorage.getItem("cryptohost_wallet") ||
  localStorage.getItem("wallet_data");
      if (!raw) {
        setLocalWallet(null);
        return;
      }

      const parsed = JSON.parse(raw);
      setLocalWallet(parsed);
    } catch (err) {
      console.error("Failed to load local CryptoHost wallet:", err);
      setLocalWallet(null);
    }
  }, []);

  useEffect(() => {
    const loadStandaloneBalances = async () => {
      if (!localWallet?.address || activeMode !== "standalone") return;

      try {
        setStandaloneLoading(true);

        const ethWei = await provider.getBalance(localWallet.address);
        const ethFormatted = Number(ethers.formatEther(ethWei)).toFixed(4);
        setStandaloneEthBalance(ethFormatted);

        const usdt = new ethers.Contract(USDT_CONTRACT, erc20Abi, provider);
        const rawUsdt = await usdt.balanceOf(localWallet.address);
        const decimals = await usdt.decimals();
        const usdtFormatted = Number(
          ethers.formatUnits(rawUsdt, decimals)
        ).toFixed(2);

        setStandaloneUsdtBalance(usdtFormatted);
      } catch (err) {
        console.error("Failed to fetch standalone balances:", err);
        setStandaloneEthBalance("0.0000");
        setStandaloneUsdtBalance("0.00");
      } finally {
        setStandaloneLoading(false);
      }
    };

    loadStandaloneBalances();
  }, [localWallet, activeMode]);

  useEffect(() => {
    if (wallet?.isConnected && wallet?.address) {
      setActiveMode("external");
    } else if (localWallet?.address) {
      setActiveMode("standalone");
    } else {
      setActiveMode("none");
    }
  }, [wallet?.isConnected, wallet?.address, localWallet]);

  useEffect(() => {
    const checkWallet = async () => {
      setCheckingWallet(true);
      await readWalletData();
      setCheckingWallet(false);
    };

    checkWallet();

    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (!accounts || accounts.length === 0) {
          resetWalletState();
          return;
        }
        await readWalletData();
      };

      const handleChainChanged = async () => {
        await readWalletData();
      };

      window.ethereum.on?.("accountsChanged", handleAccountsChanged);
      window.ethereum.on?.("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
      };
    }
  }, [readWalletData]);

  const displayAddress =
    activeMode === "external"
      ? wallet.address
      : activeMode === "standalone"
      ? localWallet?.address || "No connected account"
      : "No connected account";

  const displayShortAddress =
    displayAddress && displayAddress.startsWith("0x")
      ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`
      : displayAddress;

  const displayNetwork =
    activeMode === "external"
      ? wallet.network || "Ethereum Mainnet"
      : activeMode === "standalone"
      ? "Ethereum Mainnet"
      : "Waiting for connection";

  const displayEthBalance =
    activeMode === "external"
      ? `${wallet.ethBalance} ETH`
      : activeMode === "standalone"
      ? `${standaloneEthBalance} ETH`
      : "0.0000 ETH";

  const displayUsdtBalance =
    activeMode === "external"
      ? `${wallet.usdtBalance} USDT`
      : activeMode === "standalone"
      ? `${standaloneUsdtBalance} USDT`
      : "0.00 USDT";

  const receiveAddress =
    activeMode === "external"
      ? wallet.address || "-"
      : activeMode === "standalone"
      ? localWallet?.address || "-"
      : "-";

  const connectWallet = async () => {
    try {
      setLoading(true);
      clearMessages();
      setLastTxHash("");

      if (!window.ethereum) {
        setError("Please install Trust Wallet extension or MetaMask.");
        return;
      }

      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      await readWalletData();
      setSuccess("Wallet connected successfully.");
    } catch (err: any) {
      console.error("Connect wallet error:", err);

      if (err?.code === 4001) {
        setError("Connection request was rejected.");
      } else {
        setError(err?.message || "Failed to connect wallet.");
      }
    } finally {
      setLoading(false);
    }
  };

  const disconnectUiOnly = () => {
    resetWalletState();
    setRecipient("");
    setEthAmount("");
    setUsdtAmount("");
    setLastTxHash("");
    clearMessages();
    setSuccess("Disconnected from dashboard view.");
  };

  const validateRecipient = (address: string) => {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  };

  const sendETH = async () => {
    try {
      clearMessages();
      setLastTxHash("");
      setTxHash("");

      if (!wallet.isConnected) {
        setError("Connect your wallet first.");
        return;
      }

      if (!validateRecipient(recipient)) {
        setError("Please enter a valid recipient address.");
        return;
      }

      if (!ethAmount || Number(ethAmount) <= 0) {
        setError("Please enter a valid ETH amount.");
        return;
      }

      setSendingEth(true);

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(ethAmount),
      });

      setLastTxHash(tx.hash);
      setTxHash(tx.hash);
      setSuccess(`ETH transaction submitted: ${tx.hash}`);

      await tx.wait();
      await readWalletData();
      setEthAmount("");
    } catch (err: any) {
      console.error("ETH send error:", err);
      setError(err?.reason || err?.message || "Failed to send ETH.");
    } finally {
      setSendingEth(false);
    }
  };

  const sendUSDT = async () => {
    try {
      clearMessages();
      setLastTxHash("");
      setTxHash("");

      if (!wallet.isConnected) {
        setError("Connect your wallet first.");
        return;
      }

      if (wallet.chainId !== "1") {
        setError("USDT send is set for Ethereum Mainnet only.");
        return;
      }

      if (!validateRecipient(recipient)) {
        setError("Please enter a valid recipient address.");
        return;
      }

      if (!usdtAmount || Number(usdtAmount) <= 0) {
        setError("Please enter a valid USDT amount.");
        return;
      }

      setSendingUsdt(true);

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();

      const usdtWithSigner = new ethers.Contract(
        USDT_CONTRACT,
        usdtAbi,
        signer
      );

      const decimals = await usdtWithSigner.decimals();
      const amount = ethers.parseUnits(usdtAmount, decimals);

      const tx = await usdtWithSigner.transfer(recipient, amount);

      setLastTxHash(tx.hash);
      setTxHash(tx.hash);
      setSuccess(`USDT transaction submitted: ${tx.hash}`);

      await tx.wait();
      await readWalletData();
      setUsdtAmount("");
    } catch (err: any) {
      console.error("USDT send error:", err);
      setError(err?.reason || err?.message || "Failed to send USDT.");
    } finally {
      setSendingUsdt(false);
    }
  };

  const actionBtnBase =
    "rounded-2xl px-4 py-3 text-sm font-semibold transition border";
  const activeAction =
    "border-cyan-400/40 bg-cyan-500/15 text-cyan-200";
  const inactiveAction =
    "border-white/10 bg-white/5 text-white/70 hover:bg-white/10";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#08152f] via-[#071229] to-[#030814] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 md:gap-5">
              <WalletLogo />

              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">
                  CryptoHost Wallet
                </p>
                <h1 className="mt-1 text-4xl font-bold leading-tight md:text-5xl">
                  Secure Web3 Dashboard
                </h1>
                <p className="mt-2 text-sm text-white/70 md:text-base">
                  Connect your browser wallet to manage ETH and USDT in one place.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {!wallet.isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={loading || checkingWallet}
                  className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-[#04101f] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Connecting..." : "Connect Wallet"}
                </button>
              ) : (
                <>
                  <button
                    onClick={readWalletData}
                    disabled={loading}
                    className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Refresh
                  </button>

                  <button
                    onClick={disconnectUiOnly}
                    className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200 break-all">
            {success}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {activeMode === "external" && (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
              External Wallet Active
            </span>
          )}

          {activeMode === "standalone" && (
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
              CryptoHost Wallet Active
            </span>
          )}

          {standaloneLoading && activeMode === "standalone" && (
            <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300">
              Loading blockchain data...
            </span>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
            <p className="text-sm text-white/60">Connection Status</p>
            <h2 className="mt-3 text-2xl font-bold">
              {checkingWallet
                ? "Checking..."
                : activeMode === "external"
                ? "Connected"
                : activeMode === "standalone"
                ? "CryptoHost Wallet"
                : "Not Connected"}
            </h2>
            <p className="mt-2 text-sm text-white/60">Wallet session status</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
            <p className="text-sm text-white/60">Wallet Address</p>
            <h2 className="mt-3 break-all text-xl font-bold">
              {displayShortAddress || "-"}
            </h2>
            <p className="mt-2 break-all text-xs text-white/60">
              {displayAddress}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
            <p className="text-sm text-white/60">ETH Balance</p>
            <h2 className="mt-3 text-2xl font-bold">{displayEthBalance}</h2>
            <p className="mt-2 text-sm text-white/60">Live wallet balance</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
            <p className="text-sm text-white/60">USDT Balance</p>
            <h2 className="mt-3 text-2xl font-bold">{displayUsdtBalance}</h2>
            <p className="mt-2 text-sm text-white/60">Ethereum Mainnet only</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
            <p className="text-sm text-white/60">Network</p>
            <h2 className="mt-3 text-2xl font-bold">{displayNetwork}</h2>
            <p className="mt-2 text-sm text-white/60">
              Chain ID: {wallet.isConnected ? wallet.chainId : "-"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <h3 className="text-xl font-bold">Wallet Overview</h3>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/60">Account</p>
                <p className="mt-1 break-all text-sm font-medium text-white">
                  {displayAddress}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/60">Blockchain</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {displayNetwork}
                  </p>

                  {txHash && (
                    <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                      <p className="font-semibold text-emerald-400">
                        Transaction Successful
                      </p>

                      <p className="mt-1 break-all text-xs text-gray-400">
                        {txHash}
                      </p>

                      <a
                        href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm text-emerald-400 underline"
                      >
                        View on Etherscan ↗
                      </a>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/60">Receive Address</p>
                  <p className="mt-1 break-all text-sm font-medium text-white">
                    {receiveAddress}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/60">Available ETH</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {displayEthBalance}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/60">Available USDT</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {displayUsdtBalance}
                  </p>
                </div>
              </div>

              {lastTxHash && explorerBaseUrl && (
                <a
                  href={`${explorerBaseUrl}${lastTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all rounded-2xl border border-emerald-400/15 bg-emerald-500/10 p-4 text-sm text-emerald-200 hover:bg-emerald-500/15"
                >
                  View last transaction on explorer: {lastTxHash}
                </a>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab("send")}
                className={`${actionBtnBase} ${activeTab === "send" ? activeAction : inactiveAction}`}
              >
                Send
              </button>
              <button
                onClick={() => setActiveTab("receive")}
                className={`${actionBtnBase} ${activeTab === "receive" ? activeAction : inactiveAction}`}
              >
                Receive
              </button>
              <button
                onClick={() => setActiveTab("buy")}
                className={`${actionBtnBase} ${activeTab === "buy" ? activeAction : inactiveAction}`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveTab("sell")}
                className={`${actionBtnBase} ${activeTab === "sell" ? activeAction : inactiveAction}`}
              >
                Sell
              </button>
              <button
                onClick={() => setActiveTab("swap")}
                className={`${actionBtnBase} ${activeTab === "swap" ? activeAction : inactiveAction}`}
              >
                Swap
              </button>

              <Link
                href="/create-wallet"
                className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"
              >
                Create Wallet
              </Link>

              <Link
                href="/import-wallet"
                className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/15"
              >
                Import Wallet
              </Link>

              <Link
                href="/my-wallet"
                className="rounded-2xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/15"
              >
                My Wallet
              </Link>
            </div>

            {activeTab === "send" && (
              <div className="mt-5 space-y-4">
                <h3 className="text-xl font-bold">Send Assets</h3>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    ETH Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    placeholder="0.001"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
                  />
                </div>

                <button
                  onClick={sendETH}
                  disabled={!wallet.isConnected || sendingEth}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-4 text-sm font-semibold text-[#04101f] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sendingEth ? "Sending ETH..." : "Send ETH"}
                </button>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    USDT Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={usdtAmount}
                    onChange={(e) => setUsdtAmount(e.target.value)}
                    placeholder="10"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
                  />
                </div>

                <button
                  onClick={sendUSDT}
                  disabled={!wallet.isConnected || sendingUsdt}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-semibold transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sendingUsdt ? "Sending USDT..." : "Send USDT"}
                </button>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                  ETH sends need enough ETH balance. USDT sends also need ETH for gas.
                </div>
              </div>
            )}

            {activeTab === "receive" && (
              <div className="mt-5 space-y-4">
                <h3 className="text-xl font-bold">Receive</h3>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/60">Your wallet address</p>
                  <p className="mt-2 break-all text-sm text-white">
                    {displayAddress !== "No connected account"
                      ? displayAddress
                      : "Connect wallet first"}
                  </p>
                </div>
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                  Use this address to receive ETH or ERC-20 assets on the current network.
                </div>
              </div>
            )}

            {activeTab === "buy" && (
              <div className="mt-5 space-y-4">
                <h3 className="text-xl font-bold">Buy</h3>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                  Buy flow placeholder. Next step natin dito puwede natin ilagay ang
                  direct funding links or on-ramp integration.
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm font-semibold hover:bg-white/15">
                    Buy ETH
                  </button>
                  <button className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm font-semibold hover:bg-white/15">
                    Buy USDT
                  </button>
                </div>
              </div>
            )}

            {activeTab === "sell" && (
              <div className="mt-5 space-y-4">
                <h3 className="text-xl font-bold">Sell</h3>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                  Sell flow placeholder. Dito natin puwedeng ilagay later ang off-ramp or
                  exchange redirection.
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm font-semibold hover:bg-white/15">
                    Sell ETH
                  </button>
                  <button className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm font-semibold hover:bg-white/15">
                    Sell USDT
                  </button>
                </div>
              </div>
            )}

            {activeTab === "swap" && (
              <div className="mt-5 space-y-4">
                <h3 className="text-xl font-bold">Swap</h3>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                  Swap module placeholder. Next upgrade natin dito ang token-to-token swap UI.
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm text-white/60">From</p>
                    <p className="mt-2 text-white">ETH</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm text-white/60">To</p>
                    <p className="mt-2 text-white">USDT</p>
                  </div>
                </div>
                <button className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-semibold hover:bg-white/15">
                  Open Swap Flow
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}