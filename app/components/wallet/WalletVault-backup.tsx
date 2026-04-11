"use client";

import { useEffect, useMemo, useState } from "react";
import WalletLogo from "@/app/components/wallet/WalletLogo";
import {
  decryptPrivateKey,
  encryptPrivateKey,
  type EncryptedVaultPayload,
} from "@/app/lib/wallet-crypto";
import {
  clearLegacyWalletData,
  getLegacyWalletData,
  getStoredVault,
  saveStoredVault,
} from "@/app/lib/wallet-storage";

type StatusType = "idle" | "success" | "error";
type SendStatusType = "idle" | "success" | "error";
type SwapStatusType = "idle" | "success" | "error";
type BuyStatusType = "idle" | "success" | "error";
type SellStatusType = "idle" | "success" | "error";

function maskAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function isValidEvmAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function getMockRate(from: string, to: string) {
  if (from === to) return 1;

  const rates: Record<string, number> = {
    "ETH_USDT": 3500,
    "ETH_USDC": 3495,
    "ETH_BNB": 5.6,
    "ETH_BTC": 0.052,
    "ETH_SOL": 23.5,

    "BNB_USDT": 625,
    "BNB_USDC": 624,
    "BNB_ETH": 1 / 5.6,
    "BNB_BTC": 0.009,
    "BNB_SOL": 4.2,

    "BTC_USDT": 67000,
    "BTC_USDC": 66950,
    "BTC_ETH": 1 / 0.052,
    "BTC_BNB": 111,
    "BTC_SOL": 450,

    "SOL_USDT": 145,
    "SOL_USDC": 145,
    "SOL_ETH": 1 / 23.5,
    "SOL_BNB": 1 / 4.2,
    "SOL_BTC": 1 / 450,

    "USDT_ETH": 1 / 3500,
    "USDC_ETH": 1 / 3495,
    "USDT_BNB": 1 / 625,
    "USDC_BNB": 1 / 624,
    "USDT_BTC": 1 / 67000,
    "USDC_BTC": 1 / 66950,
    "USDT_SOL": 1 / 145,
    "USDC_SOL": 1 / 145,

    "USDT_USDC": 1,
    "USDC_USDT": 1,
  };

  return rates[`${from}_${to}`] ?? 1;
}

export default function WalletVault() {
  const [vault, setVault] = useState<EncryptedVaultPayload | null>(null);
  const [legacyAddress, setLegacyAddress] = useState("");
  const [legacyPrivateKey, setLegacyPrivateKey] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [unlockPasscode, setUnlockPasscode] = useState("");
  const [unlockedPrivateKey, setUnlockedPrivateKey] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusType, setStatusType] = useState<StatusType>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendAsset, setSendAsset] = useState("ETH");
  const [sendStatusType, setSendStatusType] = useState<SendStatusType>("idle");
  const [sendStatusMessage, setSendStatusMessage] = useState("");
  const [sendBusy, setSendBusy] = useState(false);

  const [swapFrom, setSwapFrom] = useState("ETH");
  const [swapTo, setSwapTo] = useState("USDT");
  const [swapAmount, setSwapAmount] = useState("");
  const [swapStatusType, setSwapStatusType] = useState<SwapStatusType>("idle");
  const [swapStatusMessage, setSwapStatusMessage] = useState("");
  const [swapBusy, setSwapBusy] = useState(false);

  const [buyAsset, setBuyAsset] = useState("ETH");
  const [buyFiat, setBuyFiat] = useState("USD");
  const [buyAmount, setBuyAmount] = useState("");
  const [buyStatusType, setBuyStatusType] = useState<BuyStatusType>("idle");
  const [buyStatusMessage, setBuyStatusMessage] = useState("");
  const [buyBusy, setBuyBusy] = useState(false);

  const [sellAsset, setSellAsset] = useState("USDT");
  const [sellAmount, setSellAmount] = useState("");
  const [sellDestination, setSellDestination] = useState("");
  const [sellStatusType, setSellStatusType] = useState<SellStatusType>("idle");
  const [sellStatusMessage, setSellStatusMessage] = useState("");
  const [sellBusy, setSellBusy] = useState(false);

  useEffect(() => {
    const storedVault = getStoredVault();

    if (storedVault) {
      setVault(storedVault);
      return;
    }

    const legacy = getLegacyWalletData();

    if (legacy) {
      setLegacyAddress(legacy.address);
      setLegacyPrivateKey(legacy.privateKey);
      return;
    }

    const objectKeys = [
      "cryptohost_generated_wallet",
      "cryptohost_wallet",
      "wallet_data",
    ];

    for (const key of objectKeys) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw) as {
          address?: string | null;
          privateKey?: string | null;
        };

        setLegacyAddress(parsed.address ?? "");
        setLegacyPrivateKey(parsed.privateKey ?? "");
        return;
      } catch {
        // ignore invalid JSON
      }
    }

    setLegacyAddress(
      window.localStorage.getItem("cryptohost_wallet_address") ?? ""
    );
    setLegacyPrivateKey(
      window.localStorage.getItem("cryptohost_wallet_private_key") ?? ""
    );
  }, []);

  const hasVault = !!vault;
  const isUnlocked = !!unlockedPrivateKey;

  const activeAddress = useMemo(() => {
    if (vault?.address) return vault.address;
    return legacyAddress || "";
  }, [vault, legacyAddress]);

  const qrUrl = useMemo(() => {
    if (!activeAddress) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      activeAddress
    )}`;
  }, [activeAddress]);

  const swapRate = useMemo(() => {
    return getMockRate(swapFrom, swapTo);
  }, [swapFrom, swapTo]);

  const estimatedSwapOutput = useMemo(() => {
    const amountValue = Number(swapAmount);
    if (!swapAmount || Number.isNaN(amountValue) || amountValue <= 0) return "0";
    return (amountValue * swapRate).toFixed(6);
  }, [swapAmount, swapRate]);

  function setFeedback(type: StatusType, message: string) {
    setStatusType(type);
    setStatusMessage(message);
  }

  function setSendFeedback(type: SendStatusType, message: string) {
    setSendStatusType(type);
    setSendStatusMessage(message);
  }

  function setSwapFeedback(type: SwapStatusType, message: string) {
    setSwapStatusType(type);
    setSwapStatusMessage(message);
  }

  function setBuyFeedback(type: BuyStatusType, message: string) {
    setBuyStatusType(type);
    setBuyStatusMessage(message);
  }

  function setSellFeedback(type: SellStatusType, message: string) {
    setSellStatusType(type);
    setSellStatusMessage(message);
  }

  function resetUnlockState() {
    setUnlockedPrivateKey("");
    setUnlockPasscode("");
    setShowPrivateKey(false);
  }

  async function handleSetupPasscode() {
    if (!legacyAddress || !legacyPrivateKey) {
      setFeedback("error", "No wallet data found to secure yet.");
      return;
    }

    if (passcode.length < 6) {
      setFeedback("error", "Passcode must be at least 6 characters.");
      return;
    }

    if (passcode !== confirmPasscode) {
      setFeedback("error", "Passcodes do not match.");
      return;
    }

    try {
      setBusy(true);
      setFeedback("idle", "");

      const encrypted = await encryptPrivateKey(
        legacyPrivateKey,
        passcode,
        legacyAddress
      );

      saveStoredVault(encrypted);
      clearLegacyWalletData();

      setVault(encrypted);
      setLegacyPrivateKey("");
      setPasscode("");
      setConfirmPasscode("");

      setFeedback(
        "success",
        "Wallet secured successfully. Plain private key storage has been cleared."
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to secure wallet.";
      setFeedback("error", message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlock() {
    if (!vault) {
      setFeedback("error", "No secured wallet found.");
      return;
    }

    if (!unlockPasscode) {
      setFeedback("error", "Enter your wallet passcode first.");
      return;
    }

    try {
      setBusy(true);
      setFeedback("idle", "");

      const privateKey = await decryptPrivateKey(vault, unlockPasscode);
      setUnlockedPrivateKey(privateKey);
      setFeedback("success", "Wallet unlocked successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to unlock wallet.";
      setFeedback("error", message);
      resetUnlockState();
    } finally {
      setBusy(false);
    }
  }

  function handleLock() {
    resetUnlockState();
    setFeedback("success", "Wallet locked.");
  }

  async function handleCopyAddress() {
    if (!activeAddress) return;

    try {
      await navigator.clipboard.writeText(activeAddress);
      setFeedback("success", "Wallet address copied.");
    } catch {
      setFeedback("error", "Failed to copy wallet address.");
    }
  }

  async function handleCopyPrivateKey() {
    if (!unlockedPrivateKey) return;

    try {
      await navigator.clipboard.writeText(unlockedPrivateKey);
      setFeedback("success", "Private key copied. Keep it secret.");
    } catch {
      setFeedback("error", "Failed to copy private key.");
    }
  }

  function handleLogout() {
    resetUnlockState();
    window.location.href = "/login";
  }

  async function handleSendPreview() {
    setSendFeedback("idle", "");

    if (!hasVault) {
      setSendFeedback("error", "Secure your wallet first before sending.");
      return;
    }

    if (!isUnlocked) {
      setSendFeedback("error", "Unlock your wallet first before sending.");
      return;
    }

    if (!sendTo.trim()) {
      setSendFeedback("error", "Recipient address is required.");
      return;
    }

    if (!isValidEvmAddress(sendTo.trim())) {
      setSendFeedback("error", "Enter a valid wallet address.");
      return;
    }

    if (!sendAmount.trim()) {
      setSendFeedback("error", "Amount is required.");
      return;
    }

    const amountValue = Number(sendAmount);

    if (Number.isNaN(amountValue) || amountValue <= 0) {
      setSendFeedback("error", "Enter a valid amount greater than zero.");
      return;
    }

    if (sendTo.trim().toLowerCase() === activeAddress.toLowerCase()) {
      setSendFeedback("error", "Sender and recipient address cannot be the same.");
      return;
    }

    try {
      setSendBusy(true);
      await new Promise((resolve) => setTimeout(resolve, 700));

      setSendFeedback(
        "success",
        `Send panel is ready. Preview validated for ${sendAmount} ${sendAsset} to ${maskAddress(
          sendTo.trim()
        )}.`
      );
    } catch {
      setSendFeedback("error", "Unable to prepare transaction preview.");
    } finally {
      setSendBusy(false);
    }
  }

  async function handleSwapPreview() {
    setSwapFeedback("idle", "");

    if (!hasVault) {
      setSwapFeedback("error", "Secure your wallet first before converting.");
      return;
    }

    if (!isUnlocked) {
      setSwapFeedback("error", "Unlock your wallet first before converting.");
      return;
    }

    if (!swapAmount.trim()) {
      setSwapFeedback("error", "Enter the amount you want to convert.");
      return;
    }

    const amountValue = Number(swapAmount);

    if (Number.isNaN(amountValue) || amountValue <= 0) {
      setSwapFeedback("error", "Enter a valid conversion amount.");
      return;
    }

    if (swapFrom === swapTo) {
      setSwapFeedback("error", "Choose different assets for conversion.");
      return;
    }

    try {
      setSwapBusy(true);
      await new Promise((resolve) => setTimeout(resolve, 700));

      setSwapFeedback(
        "success",
        `Convert preview ready: ${swapAmount} ${swapFrom} ≈ ${estimatedSwapOutput} ${swapTo}.`
      );
    } catch {
      setSwapFeedback("error", "Unable to prepare conversion preview.");
    } finally {
      setSwapBusy(false);
    }
  }

  async function handleBuyPreview() {
    setBuyFeedback("idle", "");

    if (!buyAmount.trim()) {
      setBuyFeedback("error", "Enter the amount you want to buy.");
      return;
    }

    const amountValue = Number(buyAmount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      setBuyFeedback("error", "Enter a valid buy amount.");
      return;
    }

    try {
      setBuyBusy(true);
      await new Promise((resolve) => setTimeout(resolve, 700));
      setBuyFeedback(
        "success",
        `Buy preview ready: ${buyAmount} ${buyFiat} worth of ${buyAsset}.`
      );
    } catch {
      setBuyFeedback("error", "Unable to prepare buy preview.");
    } finally {
      setBuyBusy(false);
    }
  }

  async function handleSellPreview() {
    setSellFeedback("idle", "");

    if (!isUnlocked) {
      setSellFeedback("error", "Unlock your wallet first before selling.");
      return;
    }

    if (!sellAmount.trim()) {
      setSellFeedback("error", "Enter the amount you want to sell.");
      return;
    }

    if (!sellDestination.trim()) {
      setSellFeedback("error", "Enter bank or wallet destination.");
      return;
    }

    const amountValue = Number(sellAmount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      setSellFeedback("error", "Enter a valid sell amount.");
      return;
    }

    try {
      setSellBusy(true);
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSellFeedback(
        "success",
        `Sell preview ready: ${sellAmount} ${sellAsset} to ${sellDestination}.`
      );
    } catch {
      setSellFeedback("error", "Unable to prepare sell preview.");
    } finally {
      setSellBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10204f_0%,#07122d_40%,#040915_100%)] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
          <WalletLogo />

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              <div className="font-medium">Security mode enabled</div>
              <div className="mt-1 text-emerald-100/80">
                Private key is encrypted locally and never displayed until unlocked.
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Wallet Vault</h1>
                <p className="mt-2 text-sm text-white/70">
                  Secure access layer for your CryptoHost wallet.
                </p>
                {/* TOKEN BALANCES */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
  {[
    { name: "ETH", balance: "0.0000" },
    { name: "USDT", balance: "0.0000" },
    { name: "BNB", balance: "0.0000" },
    { name: "BTC", balance: "0.0000" },
  ].map((token) => (
    <div
      key={token.name}
      className="rounded-2xl border border-white/10 bg-black/20 p-4"
    >
      <div className="text-xs text-white/60">{token.name}</div>
      <div className="text-lg font-semibold text-white mt-1">
        {token.balance}
      </div>
    </div>
  ))}
</div>


{/* QUICK ACTION BUTTONS */}
<div className="flex gap-3 mt-4">
  <button
    type="button"
    onClick={() =>
      document
        .getElementById("send-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    className="flex-1 bg-blue-500 py-3 rounded-xl text-white font-semibold hover:scale-105 transition"
  >
    Send
  </button>

  <button
    type="button"
    onClick={() =>
      document
        .getElementById("receive-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    className="flex-1 bg-green-500 py-3 rounded-xl text-white font-semibold hover:scale-105 transition"
  >
    Receive
  </button>

  <button
    type="button"
    onClick={() =>
      document
        .getElementById("swap-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    className="flex-1 bg-purple-500 py-3 rounded-xl text-white font-semibold hover:scale-105 transition"
  >
    Swap
  </button>
</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right text-xs text-white/70">
                <div className="text-white/50">User</div>
                <div className="mt-1 break-all font-medium text-white">
                  Authenticated session
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-blue-300/70">
                  Wallet Address
                </div>
                <div className="mt-3 break-all text-base font-medium text-white">
                  {activeAddress || "No wallet found"}
                </div>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  disabled={!activeAddress}
                  className="mt-4 rounded-xl border border-blue-400/30 bg-blue-500/15 px-4 py-2 text-sm font-medium text-blue-100 transition hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Copy address
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-amber-300/70">
                  Wallet State
                </div>
                <div className="mt-3 text-base font-medium">
                  {hasVault ? (
                    isUnlocked ? (
                      <span className="text-emerald-300">Unlocked</span>
                    ) : (
                      <span className="text-amber-300">Locked</span>
                    )
                  ) : (
                    <span className="text-rose-300">Needs passcode setup</span>
                  )}
                </div>
                <div className="mt-2 text-sm text-white/65">
                  {hasVault
                    ? `Address: ${maskAddress(activeAddress)}`
                    : "Secure your generated wallet with a passcode first."}
                </div>
              </div>
            </div>

            {statusMessage ? (
              <div
                className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                  statusType === "success"
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                    : statusType === "error"
                    ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
                    : "border-white/10 bg-white/5 text-white/80"
                }`}
              >
                {statusMessage}
              </div>
            ) : null}

            {!hasVault ? (
              <div className="mt-6 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5">
                <h2 className="text-xl font-semibold text-amber-100">
                  Setup wallet passcode
                </h2>
                <p className="mt-2 text-sm text-amber-50/85">
                  Your wallet exists, but it is not yet protected by local encryption.
                  Set a passcode now to encrypt the private key and remove plain storage.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-white/80">
                      New passcode
                    </label>
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none placeholder:text-white/30"
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white/80">
                      Confirm passcode
                    </label>
                    <input
                      type="password"
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none placeholder:text-white/30"
                      placeholder="Repeat passcode"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSetupPasscode}
                  disabled={busy || !legacyAddress || !legacyPrivateKey}
                  className="mt-5 rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Securing wallet..." : "Secure wallet now"}
                </button>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <h2 className="text-xl font-semibold">Unlock wallet</h2>
                  <p className="mt-2 text-sm text-white/65">
                    Enter your passcode to temporarily decrypt the private key in memory only.
                  </p>

                  <label className="mt-5 block text-sm text-white/80">
                    Wallet passcode
                  </label>
                  <input
                    type="password"
                    value={unlockPasscode}
                    onChange={(e) => setUnlockPasscode(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none"
                    placeholder="Enter your passcode"
                  />

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleUnlock}
                      disabled={busy}
                      className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy ? "Unlocking..." : "Unlock wallet"}
                    </button>

                    <button
                      type="button"
                      onClick={handleLock}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                    >
                      Lock wallet
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-5">
                  <h2 className="text-xl font-semibold text-rose-100">
                    Private key safety warning
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm text-rose-50/85">
                    <li>• Never share your private key with anyone.</li>
                    <li>• Do not paste it into unknown websites or chat apps.</li>
                    <li>• Only reveal it when absolutely necessary.</li>
                    <li>• Lock the wallet again after use.</li>
                  </ul>
                </div>
              </div>
            )}

            {hasVault && isUnlocked ? (
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Private key access</h2>
                    <p className="mt-2 text-sm text-white/65">
                      Hidden by default. Reveal only when required.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPrivateKey((prev) => !prev)}
                      className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 font-medium text-amber-100 transition hover:bg-amber-400/20"
                    >
                      {showPrivateKey ? "Hide private key" : "Show private key"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyPrivateKey}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-white transition hover:bg-white/10"
                    >
                      Copy private key
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-[#050b18] p-4">
                  <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">
                    Sensitive field
                  </div>
                  <code className="block break-all text-sm text-emerald-300">
                    {showPrivateKey ? unlockedPrivateKey : "•".repeat(96)}
                  </code>
                </div>
              </div>
            ) : null}

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Send</h2>
                <p className="mt-2 text-sm text-white/65">
                  Safe send panel preview. This validates the transaction details before live blockchain execution is added.
                </p>
              </div>

              {sendStatusMessage ? (
                <div
                  className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                    sendStatusType === "success"
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                      : sendStatusType === "error"
                      ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
                      : "border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  {sendStatusMessage}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/80">
                    Recipient address
                  </label>
                  <input
                    type="text"
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none placeholder:text-white/30"
                    placeholder="0x..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    Asset
                  </label>
                  <select
                    value={sendAsset}
                    onChange={(e) => setSendAsset(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none"
                  >
                    <option value="ETH">ETH</option>
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none placeholder:text-white/30"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                <div className="flex items-center justify-between gap-4">
                  <span>From</span>
                  <span className="font-medium text-white">
                    {maskAddress(activeAddress) || "Not available"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>To</span>
                  <span className="font-medium text-white">
                    {sendTo ? maskAddress(sendTo) : "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Asset</span>
                  <span className="font-medium text-white">{sendAsset}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Amount</span>
                  <span className="font-medium text-white">
                    {sendAmount || "0"} {sendAsset}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendPreview}
                disabled={sendBusy}
                className="mt-5 w-full rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendBusy ? "Preparing send..." : "Validate send"}
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Swap / Convert</h2>
                <p className="mt-2 text-sm text-white/65">
                  Safe convert preview. This estimates asset conversion before live swap execution is added.
                </p>
              </div>

              {swapStatusMessage ? (
                <div
                  className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                    swapStatusType === "success"
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                      : swapStatusType === "error"
                      ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
                      : "border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  {swapStatusMessage}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    From
                  </label>
                  <select
                    value={swapFrom}
                    onChange={(e) => setSwapFrom(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none"
                  >
                    <option value="ETH">ETH</option>
                    <option value="BNB">BNB</option>
                    <option value="BTC">BTC</option>
                    <option value="SOL">SOL</option>
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    To
                  </label>
                  <select
                    value={swapTo}
                    onChange={(e) => setSwapTo(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none"
                  >
                    <option value="ETH">ETH</option>
                    <option value="BNB">BNB</option>
                    <option value="BTC">BTC</option>
                    <option value="SOL">SOL</option>
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/80">
                    Amount to convert
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none placeholder:text-white/30"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                <div className="flex items-center justify-between gap-4">
                  <span>Rate</span>
                  <span className="font-medium text-white">
                    1 {swapFrom} ≈ {swapRate.toFixed(6)} {swapTo}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Estimated output</span>
                  <span className="font-medium text-white">
                    {estimatedSwapOutput} {swapTo}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Mode</span>
                  <span className="font-medium text-white">Preview only</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSwapPreview}
                disabled={swapBusy}
                className="mt-5 w-full rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {swapBusy ? "Preparing convert..." : "Validate convert"}
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Buy</h2>
                <p className="mt-2 text-sm text-white/65">
                  Safe buy preview. This prepares a purchase flow before live provider integration is added.
                </p>
              </div>

              {buyStatusMessage ? (
                <div
                  className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                    buyStatusType === "success"
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                      : buyStatusType === "error"
                      ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
                      : "border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  {buyStatusMessage}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    Asset to buy
                  </label>
                  <select
                    value={buyAsset}
                    onChange={(e) => setBuyAsset(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none"
                  >
                    <option value="ETH">ETH</option>
                    <option value="BNB">BNB</option>
                    <option value="BTC">BTC</option>
                    <option value="SOL">SOL</option>
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    Pay with
                  </label>
                  <select
                    value={buyFiat}
                    onChange={(e) => setBuyFiat(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="PHP">PHP</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/80">
                    Buy amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none placeholder:text-white/30"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                <div className="flex items-center justify-between gap-4">
                  <span>Asset</span>
                  <span className="font-medium text-white">{buyAsset}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Currency</span>
                  <span className="font-medium text-white">{buyFiat}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Mode</span>
                  <span className="font-medium text-white">Preview only</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBuyPreview}
                disabled={buyBusy}
                className="mt-5 w-full rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {buyBusy ? "Preparing buy..." : "Validate buy"}
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Sell</h2>
                <p className="mt-2 text-sm text-white/65">
                  Safe sell preview. This prepares off-ramp details before live execution is added.
                </p>
              </div>

              {sellStatusMessage ? (
                <div
                  className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                    sellStatusType === "success"
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                      : sellStatusType === "error"
                      ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
                      : "border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  {sellStatusMessage}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    Asset to sell
                  </label>
                  <select
                    value={sellAsset}
                    onChange={(e) => setSellAsset(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none"
                  >
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                    <option value="ETH">ETH</option>
                    <option value="BNB">BNB</option>
                    <option value="BTC">BTC</option>
                    <option value="SOL">SOL</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none placeholder:text-white/30"
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/80">
                    Bank / wallet destination
                  </label>
                  <input
                    type="text"
                    value={sellDestination}
                    onChange={(e) => setSellDestination(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#081125] px-4 py-3 text-white outline-none placeholder:text-white/30"
                    placeholder="Bank account, exchange account, or wallet"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                <div className="flex items-center justify-between gap-4">
                  <span>Asset</span>
                  <span className="font-medium text-white">{sellAsset}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Destination</span>
                  <span className="font-medium text-white">
                    {sellDestination || "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Mode</span>
                  <span className="font-medium text-white">Preview only</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSellPreview}
                disabled={sellBusy}
                className="mt-5 w-full rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sellBusy ? "Preparing sell..." : "Validate sell"}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <h3 className="text-lg font-semibold">Receive</h3>
              <p className="mt-3 text-sm text-white/70">
                Scan this QR code or copy your wallet address to receive funds.
              </p>

              <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="mx-auto flex h-[220px] w-[220px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white p-3">
                  {qrUrl ? (
                    <img
                      src={qrUrl}
                      alt="Wallet QR Code"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-sm text-slate-500">
                      QR unavailable
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-[#050b18] p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                    Receive Address
                  </div>
                  <div className="mt-2 break-all text-sm font-medium text-white">
                    {activeAddress || "No wallet available"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  disabled={!activeAddress}
                  className="mt-4 w-full rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Copy receive address
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <h3 className="text-lg font-semibold">Current wallet</h3>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Address
                </div>
                <div className="mt-2 break-all text-sm font-medium text-white">
                  {activeAddress || "No wallet available"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}