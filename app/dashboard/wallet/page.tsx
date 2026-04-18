"use client";

import TronWalletCard from "./components/TronWalletCard";
import { getProvider } from "@/app/lib/wallet-provider";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { FEE_PERCENT, FEE_WALLET } from "../../lib/wallet-config";
import {
  saveEncryptedWallet,
  unlockEncryptedWallet,
  hasEncryptedWallet,
  getEncryptedWalletAddress,
} from "@/app/lib/wallet-security";
import { provider } from "../../lib/wallet-provider";
import { isAuthEnabled, verifyPin } from "@/app/lib/cryptohost-auth";
import { supabase } from "@/app/lib/supabase/client";


type MarketTickerProps = {
  label: string;
  value: string;
  sub?: string;
};

type SupportMessage = {
  role: "user" | "bot";
  text: string;
};

function getSupportReply(message: string) {
  const text = message.toLowerCase().trim();

  if (
    text.includes("benefit") ||
    text.includes("ano benefits") ||
    text.includes("why choose") ||
    text.includes("advantage")
  ) {
    return "CryptoHost Wallet lets users securely send, receive, and manage crypto in one place with wallet access, QR receive, swap page access, and multi-asset support.";
  }

  if (
    text.includes("register") ||
    text.includes("sign up") ||
    text.includes("create account")
  ) {
    return "To register, open the CryptoHost Wallet website, sign up or create your account, verify your details if required, then log in and set up your wallet security.";
  }

  if (
    text.includes("transfer") ||
    text.includes("send crypto") ||
    text.includes("how to send") ||
    text.includes("how to transfer")
  ) {
    return "To transfer crypto, unlock your wallet, choose the asset, enter the recipient wallet address, input the amount, verify OTP or security approval, then confirm the send transaction.";
  }

  if (
    text.includes("pending") ||
    text.includes("transaction pending") ||
    text.includes("stuck")
  ) {
    return "Pending transactions are usually caused by network congestion, low gas fees, or delayed blockchain confirmation. Please wait for network confirmation or refresh your wallet.";
  }

  if (
    text.includes("wallet setup") ||
    text.includes("setup wallet") ||
    text.includes("create wallet")
  ) {
    return "For wallet setup, create or unlock your wallet using your password, then save your private key and recovery phrase in a safe offline place before using the wallet.";
  }

  if (
    text.includes("gas") ||
    text.includes("gas fee") ||
    text.includes("fee")
  ) {
    return "Gas fees are blockchain network fees required to process transactions. ETH is needed for Ethereum USDT transfers, and the fee amount may change depending on network activity.";
  }

  if (
    text.includes("forgot password") ||
    text.includes("password") ||
    text.includes("recover wallet")
  ) {
    return "If you forgot your wallet password, use your saved recovery phrase or private key to restore access. Without backup credentials, wallet recovery may not be possible.";
  }

  if (
    text.includes("balance") ||
    text.includes("not showing") ||
    text.includes("wallet not showing balance")
  ) {
    return "If balance is not showing, refresh the wallet, check the correct network, and confirm that the asset was sent to the same wallet address and supported blockchain.";
  }

  if (
    text.includes("receive") ||
    text.includes("how to receive") ||
    text.includes("deposit")
  ) {
    return "To receive crypto, open the Receive tab, copy your wallet address or QR code, and make sure the sender is using the correct network before sending funds.";
  }

  if (
    text.includes("swap") ||
    text.includes("convert")
  ) {
    return "You can use the Swap section of CryptoHost Wallet to convert supported assets. Always review network fees and final amounts before confirming.";
  }

  return "Welcome to CryptoHost Support AI. You can ask about wallet benefits, registration, transfer steps, pending transactions, gas fees, wallet setup, receiving crypto, swap, or forgotten password.";
}

function SupportChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      role: "bot",
      text: "Hi! I’m CryptoHost Support AI. Ask me about wallet setup, transfers, gas fees, pending transactions, or registration.",
    },
  ]);

  const handleSend = () => {
    const clean = input.trim();
    if (!clean) return;

    const reply = getSupportReply(clean);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: clean },
      { role: "bot", text: reply },
    ]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-[320px] rounded-3xl border border-cyan-400/20 bg-[#071923]/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="flex items-center justify-between rounded-t-3xl border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
                CryptoHost
              </p>
              <p className="text-sm font-semibold text-white">
                Customer Support AI
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-white/80"
            >
              Close
            </button>
          </div>

          <div className="max-h-[320px] space-y-2 overflow-y-auto p-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "ml-8 border border-cyan-400/20 bg-cyan-500/15 text-cyan-100"
                    : "mr-8 border border-white/10 bg-white/8 text-white/85"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {[
                "What are the wallet benefits?",
                "How to register?",
                "How to transfer crypto?",
                "Pending transaction",
              ].map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => {
                    const reply = getSupportReply(question);
                    setMessages((prev) => [
                      ...prev,
                      { role: "user", text: question },
                      { role: "bot", text: reply },
                    ]);
                  }}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] text-white/80"
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder="Ask CryptoHost Support AI..."
                className="flex-1 rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              />

              <button
                type="button"
                onClick={handleSend}
                className="rounded-2xl border border-cyan-400/25 bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-100"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-cyan-400/25 bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-100 shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
        >
          Chat Support AI
        </button>
      )}
    </div>
  );
}

function MarketTicker({
  label,
  value,
  sub,
  onClick,
}: MarketTickerProps & { onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="min-w-[120px] cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold text-white">{value}</div>
      {sub ? <div className="mt-1 text-xs text-white/45">{sub}</div> : null}
    </div>
  );
}

const MIN_FEE_ETH = 0.00002;
const USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const erc20ReadAbi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

const erc20WriteAbi = [
  "function transfer(address to, uint256 value) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

type TabKey = "send" | "receive";
type TxStatus = "pending" | "confirmed" | "failed";
type SendAsset = "ETH" | "USDT" | "BNB" | "TRX" | "USDT_TRC20";
type SecurityMethod = "email" | "phone" | "biometric" | null;

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

  const fallbackCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      alert("Copied!");
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Copy failed.");
    } finally {
      document.body.removeChild(textArea);
    }
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        alert("Copied!");
      })
      .catch(() => fallbackCopy());
  } else {
    fallbackCopy();
  }
}

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("send");
  const [selectedAsset, setSelectedAsset] = useState<SendAsset>("ETH");
  const [preferredMethod, setPreferredMethod] = useState<SecurityMethod>(null);

  const [walletAddress, setWalletAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);

  const [ethBalance, setEthBalance] = useState("0.0000");
  const [usdtBalance, setUsdtBalance] = useState("0.00");
  const [usdtSymbol, setUsdtSymbol] = useState("USDT");

  const sendSectionRef = useRef<HTMLDivElement | null>(null);

  const [marketPrices, setMarketPrices] = useState<{
    eth?: number;
    usdt?: number;
    trx?: number;
    bnb?: number;
    ethereum?: number;
    tron?: number;
    binancecoin?: number;
  }>({});

  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [recipient, setRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [sending, setSending] = useState(false);

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [transactionPin, setTransactionPin] = useState("");
  const [pendingSend, setPendingSend] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastTxHash, setLastTxHash] = useState("");

  const isValidPhone = (num: string) => /^\+[1-9]\d{7,14}$/.test(num);

  const biometricSupported =
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined";

  const safeNum = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const formatAsset = (value: number, digits = 4) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    });

  const ethAmount = safeNum(ethBalance);
  const usdtErc20Amount = safeNum(usdtBalance);

  // temporary safe fallback muna
  const trxAmount = 0;
  const bnbAmount = 0;
  const usdtTronAmount = 0;

  const combinedUsdtAmount = usdtErc20Amount + usdtTronAmount;

  // temporary safe fallback prices muna
  const ethUsdPrice = safeNum(marketPrices?.eth ?? marketPrices?.ethereum);
  const usdtUsdPrice = safeNum(marketPrices?.usdt ?? 1);
  const trxUsdPrice = safeNum(marketPrices?.trx ?? marketPrices?.tron);
  const bnbUsdPrice = safeNum(marketPrices?.bnb ?? marketPrices?.binancecoin);

  const totalUsdValue =
    ethAmount * ethUsdPrice +
    combinedUsdtAmount * usdtUsdPrice +
    trxAmount * trxUsdPrice +
    bnbAmount * bnbUsdPrice;

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
      const phrase = (wallet as any).mnemonic?.phrase || "";

      await saveEncryptedWallet(
        {
          address: wallet.address,
          privateKey: wallet.privateKey,
          ...(phrase ? { mnemonic: phrase } : {}),
        },
        cleanPassword
      );

      setWalletAddress(wallet.address);
      setPrivateKey(wallet.privateKey);
      setMnemonic(phrase);
      setShowSecrets(true);
      setIsUnlocked(false);
      setEthBalance("0.0000");
      setUsdtBalance("0.00");
      setSuccess(
        "Wallet created securely! Backup your private key and recovery phrase before continuing."
      );
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
        erc20ReadAbi,
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
    } catch (err: any) {
      console.error("BALANCE LOAD ERROR:", err);
      setError(err?.message || "Failed to load wallet balances.");
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
      setPrivateKey(unlocked.privateKey || "");
      setMnemonic((unlocked as any).mnemonic || "");
      setIsUnlocked(true);
      setShowSecrets(false);
      setPassword("");
      setSuccess("Wallet unlocked successfully!");

      await loadWalletData(unlocked.address);
    } catch (err: any) {
      console.error("UNLOCK ERROR:", err);
      setIsUnlocked(false);
      setPrivateKey("");
      setMnemonic("");
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
    void loadWalletData();
  }, [loadWalletData]);

  useEffect(() => {
    const savedMethod =
      (localStorage.getItem("preferred_2fa_method") as SecurityMethod) || null;
    setPreferredMethod(savedMethod);

    const savedPhone = localStorage.getItem("user_phone_number") || "";
    if (savedPhone) {
      setPhone(savedPhone);
    }

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        setEmail(data.user.email);
      }
    };

    void loadUser();
  }, []);

  const sendOtp = async () => {
    try {
      setError("");
      setSuccess("");
      setSendingOtp(true);
      setOtpVerified(false);
      setOtpCode("");

      if (!preferredMethod) {
        setError("Select a security method first in Security settings.");
        return;
      }

      if (preferredMethod === "biometric") {
        setError(
          biometricSupported
            ? "Biometric / passkey transaction approval is not yet connected here."
            : "Biometric / passkey is not available on this device."
        );
        return;
      }

      if (preferredMethod === "email") {
        if (!email.trim()) {
          setError("No email found for this account.");
          return;
        }

        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: false,
          },
        });

        if (otpError) {
          setError(otpError.message);
          return;
        }

        setOtpSent(true);
        setSuccess("Verification code sent to your email.");
        return;
      }

      if (preferredMethod === "phone") {
        if (!phone.trim()) {
          setError("Enter your phone number first.");
          return;
        }

        if (!isValidPhone(phone.trim())) {
          setError(
            "Enter a valid global phone number with country code (example: +14155552671)."
          );
          return;
        }

        const cleanPhone = phone.trim();
        localStorage.setItem("user_phone_number", cleanPhone);

        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: cleanPhone,
          options: {
            shouldCreateUser: false,
          },
        });

        if (otpError) {
          setError(otpError.message);
          return;
        }

        setOtpSent(true);
        setSuccess("Verification code sent to your phone.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to send verification code.");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setError("");
      setSuccess("");
      setVerifyingOtp(true);

      if (!preferredMethod) {
        setError("No verification method selected.");
        return;
      }

      if (!otpCode.trim()) {
        setError("Enter the verification code.");
        return;
      }

      if (preferredMethod === "email") {
        if (!email.trim()) {
          setError("No email found for this account.");
          return;
        }

        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otpCode.trim(),
          type: "email",
        });

        if (verifyError) {
          setError(verifyError.message);
          return;
        }

        setOtpVerified(true);
        return;
      }

      if (preferredMethod === "phone") {
        if (!phone.trim()) {
          setError("Enter your phone number first.");
          return;
        }

        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone: phone.trim(),
          token: otpCode.trim(),
          type: "sms",
        });

        if (verifyError) {
          setError(verifyError.message);
          return;
        }

        setOtpVerified(true);
        return;
      }

      setError("Biometric / passkey transaction approval is not yet connected here.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to verify code.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSendAsset = async () => {
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

      if (!otpVerified) {
        setError("Verify OTP first.");
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

      if (!sendAmount.trim() || Number(sendAmount) <= 0) {
        setError(`Please enter a valid ${selectedAsset} amount.`);
        return;
      }

      const numericAmount = Number(sendAmount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        setError(`Invalid ${selectedAsset} amount.`);
        return;
      }

      let cleanedKey = privateKey.trim();
      if (!cleanedKey.startsWith("0x")) {
        cleanedKey = `0x${cleanedKey}`;
      }

      setSending(true);

      const isTronAsset =
        selectedAsset === "TRX" || selectedAsset === "USDT_TRC20";

      const activeProvider = isTronAsset
        ? null
        : getProvider(selectedAsset as "ETH" | "USDT" | "BNB");

      if (isTronAsset) {
        setError("TRON assets use the TRON wallet flow, not the ETH/BNB provider.");
        return;
      }

      if (!activeProvider) {
        setError("No provider available for selected asset.");
        return;
      }

      const signer = new ethers.Wallet(cleanedKey, activeProvider);
      const fromAddress = signer.address;

      const network = await activeProvider.getNetwork();
      const chainId = Number(network.chainId);

      if (selectedAsset === "BNB" && chainId !== 56) {
        setError("BNB sending requires a BNB Chain RPC/provider.");
        return;
      }

      if (selectedAsset === "USDT") {
        if (chainId !== 1) {
          setError("This USDT contract is configured for Ethereum Mainnet only.");
          return;
        }

        const usdtContract = new ethers.Contract(
          USDT_CONTRACT,
          erc20WriteAbi,
          signer
        );

        const decimals: number = await usdtContract.decimals();
        const amountUnits = ethers.parseUnits(sendAmount, decimals);

        const tokenBalance = await usdtContract.balanceOf(fromAddress);
        if (tokenBalance < amountUnits) {
          setError("Insufficient USDT balance.");
          return;
        }

        const gasBalance = await activeProvider.getBalance(fromAddress);
        const feeData = await activeProvider.getFeeData();

        const gasPriceForCheck =
          feeData.maxFeePerGas ??
          feeData.gasPrice ??
          ethers.parseUnits("10", "gwei");

        const gasBufferWei = gasPriceForCheck * BigInt(80000);

        if (gasBalance < gasBufferWei) {
          setError("Insufficient ETH balance for USDT network gas.");
          return;
        }

        const sendTx = await usdtContract.transfer(recipient.trim(), amountUnits);
        setLastTxHash(sendTx.hash);

        appendWalletTx({
          id: `${Date.now()}-${sendTx.hash}`,
          walletAddress: fromAddress,
          txHash: sendTx.hash,
          token: "USDT",
          amount: sendAmount,
          to: recipient.trim(),
          status: "pending",
          createdAt: new Date().toISOString(),
        });

        const receipt = await sendTx.wait();

        appendWalletTx({
          id: `${Date.now()}-${sendTx.hash}-final`,
          walletAddress: fromAddress,
          txHash: sendTx.hash,
          token: "USDT",
          amount: sendAmount,
          to: recipient.trim(),
          status: receipt?.status === 1 ? "confirmed" : "failed",
          createdAt: new Date().toISOString(),
        });

        setSuccess("USDT sent successfully.");
      } else {
        const totalAmount = numericAmount;
        const rawFeeAmount = (totalAmount * FEE_PERCENT) / 100;
        const feeAmount = rawFeeAmount >= MIN_FEE_ETH ? rawFeeAmount : 0;
        const payoutAmount = totalAmount - feeAmount;

        if (payoutAmount <= 0) {
          setError("Amount is too small after fee deduction.");
          return;
        }

        const totalWei = ethers.parseEther(totalAmount.toFixed(18));
        const feeWei = ethers.parseEther(feeAmount.toFixed(18));
        const payoutWei = ethers.parseEther(payoutAmount.toFixed(18));

        const balanceWei = await activeProvider.getBalance(fromAddress);
        const feeData = await activeProvider.getFeeData();

        const feeOverrides =
          feeData.maxFeePerGas && feeData.maxPriorityFeePerGas
            ? {
                maxFeePerGas:
                  (feeData.maxFeePerGas * BigInt(120)) / BigInt(100),
                maxPriorityFeePerGas:
                  (feeData.maxPriorityFeePerGas * BigInt(120)) / BigInt(100),
              }
            : feeData.gasPrice
            ? {
                gasPrice: (feeData.gasPrice * BigInt(120)) / BigInt(100),
              }
            : {};

        const gasPriceForCheck =
          feeData.maxFeePerGas ??
          feeData.gasPrice ??
          ethers.parseUnits("10", "gwei");

        const estimatedGasPerTx = BigInt(21000);
        const txCount = feeWei > BigInt(0) ? BigInt(2) : BigInt(1);
        const gasBufferWei = gasPriceForCheck * estimatedGasPerTx * txCount;

        if (balanceWei < totalWei + gasBufferWei) {
          setError(
            `Insufficient ${selectedAsset} balance for transfer, service fee, and network gas.`
          );
          return;
        }

        let feeTxHash = "";

        if (feeWei > BigInt(0)) {
          const feeTx = await signer.sendTransaction({
            to: FEE_WALLET,
            value: feeWei,
            ...feeOverrides,
          });

          feeTxHash = feeTx.hash;
          await feeTx.wait();
        }

        const sendTx = await signer.sendTransaction({
          to: recipient.trim(),
          value: payoutWei,
          ...feeOverrides,
        });

        setLastTxHash(sendTx.hash);

        appendWalletTx({
          id: `${Date.now()}-${sendTx.hash}`,
          walletAddress: fromAddress,
          txHash: sendTx.hash,
          token: selectedAsset,
          amount: payoutAmount.toString(),
          to: recipient.trim(),
          status: "pending",
          createdAt: new Date().toISOString(),
        });

        const receipt = await sendTx.wait();

        appendWalletTx({
          id: `${Date.now()}-${sendTx.hash}-final`,
          walletAddress: fromAddress,
          txHash: sendTx.hash,
          token: selectedAsset,
          amount: payoutAmount.toString(),
          to: recipient.trim(),
          status: receipt?.status === 1 ? "confirmed" : "failed",
          createdAt: new Date().toISOString(),
        });

        setSuccess(
          feeAmount > 0
            ? `${selectedAsset} transaction sent successfully. ${feeAmount.toFixed(
                6
              )} ${selectedAsset} fee was sent to the fee wallet.${
                feeTxHash ? ` Fee TX: ${feeTxHash}` : ""
              }`
            : `${selectedAsset} transaction sent successfully. No fee was charged because the calculated fee was below the minimum threshold.`
        );
      }

      setRecipient("");
      setSendAmount("");
      setOtpVerified(false);
      setOtpSent(false);
      setOtpCode("");

      await loadWalletData(fromAddress);
    } catch (err: any) {
      console.error(err);
      setError(err?.shortMessage || err?.message || "Transaction failed.");
    } finally {
      setSending(false);
      setPendingSend(false);
    }
  };

  const startProtectedSend = () => {
    setError("");
    setSuccess("");

    if (!otpVerified) {
      setError("Verify OTP first.");
      return;
    }

    if (isAuthEnabled() && !pendingSend) {
      setShowAuthPrompt(true);
      return;
    }

    void handleSendAsset();
  };

  const handleVerifyTransactionPin = () => {
    if (!verifyPin(transactionPin)) {
      setError("Invalid authentication PIN.");
      return;
    }

    setShowAuthPrompt(false);
    setTransactionPin("");
    setPendingSend(true);

    setTimeout(() => {
      void handleSendAsset();
    }, 0);
  };

  const estimatedUsd = useMemo(() => Number(usdtBalance ?? "0"), [usdtBalance]);

  return (
    <div className="rounded-[22px] border border-white/10 bg-[#071923]/95 p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-300 via-pink-400 to-rose-500" />
        <div className="flex-1 rounded-full bg-white/5 px-4 py-2 text-[11px] text-white/35">
          Search the wallet
        </div>
        <div className="h-7 w-7 rounded-full bg-white/8" />
      </div>

      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/75">
            Wallet • {shortenAddress(walletAddress)}
          </p>

          {walletAddress ? (
            <p className="mt-1 break-all text-[11px] text-white/55">
              {walletAddress}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {walletAddress ? (
            <button
              type="button"
              onClick={() => copyToClipboard(walletAddress)}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white/85"
            >
              Copy
            </button>
          ) : null}

          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${
              isUnlocked
                ? "border border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
                : "border border-amber-400/25 bg-amber-500/10 text-amber-200"
            }`}
          >
            {isUnlocked ? "Unlocked" : "Locked"}
          </span>

          <button
            type="button"
            onClick={() => loadWalletData()}
            className="rounded-full border border-cyan-400/25 bg-cyan-500/15 px-3 py-1.5 text-[10px] font-semibold text-cyan-200"
          >
            {loadingBalances ? "Loading" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mb-3 space-y-2">
        {!isUnlocked ? (
          <>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter wallet password"
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
          </>
        ) : (
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Wallet is unlocked and ready to send.
          </div>
        )}
      </div>

      <div className="mb-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/70">
              Wallet Market
            </p>
            <p className="text-sm font-semibold text-white">Asset Overview</p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-white/40">Total USD</p>
            <p className="text-lg font-bold text-white">
              ${formatUsd(totalUsdValue)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-5">
          <MarketTicker
            label="ETH"
            value={formatAsset(ethAmount, 6)}
            onClick={() => {
              setSelectedAsset("ETH");
              sendSectionRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <MarketTicker
            label="USDT"
            value={formatAsset(combinedUsdtAmount, 2)}
            sub="ERC20 + TRC20"
            onClick={() => {
              setSelectedAsset("USDT");
              sendSectionRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <MarketTicker
            label="TRX"
            value={formatAsset(trxAmount, 2)}
            onClick={() => {
              setSelectedAsset("TRX");
              sendSectionRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <MarketTicker
            label="BNB"
            value={formatAsset(bnbAmount, 6)}
            onClick={() => {
              setSelectedAsset("BNB");
              sendSectionRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <MarketTicker
            label="USD"
            value={`$${formatUsd(totalUsdValue)}`}
            onClick={() => {
              sendSectionRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      </div>

      <div
        ref={sendSectionRef}
        className="mt-4 rounded-[24px] border border-white/8 bg-[#0a1821] p-3"
      >
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
                Asset
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value as SendAsset)}
                className="w-full rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none"
              >
                <option value="ETH">ETH</option>
                <option value="USDT">USDT (ERC20)</option>
                <option value="BNB">BNB</option>
                <option value="TRX">TRX</option>
                <option value="USDT_TRC20">USDT (TRC20)</option>
              </select>
            </div>

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
                {selectedAsset} Amount
              </label>
              <input
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder={selectedAsset === "USDT" ? "10.00" : "0.001"}
                className="w-full rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white/80">
              Security method:{" "}
              <span className="font-semibold text-white">
                {preferredMethod === "email" && "Email OTP"}
                {preferredMethod === "phone" && "Phone OTP"}
                {preferredMethod === "biometric" && "Biometric / Passkey"}
                {!preferredMethod && "Not selected"}
              </span>
            </div>

            {preferredMethod === "email" ? (
              <div>
                <label className="mb-2 block text-sm text-white/65">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
                />
              </div>
            ) : null}

            {preferredMethod === "phone" ? (
              <div>
                <label className="mb-2 block text-sm text-white/65">
                  Phone Number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890 (include country code)"
                  className="w-full rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
                />
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={sendOtp}
                disabled={sendingOtp || preferredMethod === "biometric" || !preferredMethod}
                className="rounded-2xl border border-blue-400/25 bg-blue-500/20 px-4 py-3 text-sm font-semibold text-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingOtp ? "Sending..." : "Send OTP"}
              </button>

              <button
                type="button"
                onClick={verifyOtp}
                disabled={
                  verifyingOtp ||
                  !otpSent ||
                  preferredMethod === "biometric" ||
                  !preferredMethod
                }
                className="rounded-2xl border border-emerald-400/25 bg-emerald-500/20 px-4 py-3 text-sm font-semibold text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>
            </div>

            {preferredMethod !== "biometric" && otpSent ? (
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter OTP"
                className="w-full rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              />
            ) : null}

            {otpVerified ? (
              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                OTP verified. You can now send.
              </div>
            ) : null}

            {preferredMethod === "biometric" ? (
              <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                {biometricSupported
                  ? "Biometric / passkey transaction approval is not yet connected in the wallet send flow."
                  : "Biometric / passkey is not available on this device or browser."}
              </div>
            ) : null}

            <button
              type="button"
              onClick={startProtectedSend}
              disabled={sending || !isUnlocked || !otpVerified}
              className="w-full rounded-2xl border border-cyan-400/25 bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {!isUnlocked
                ? "Unlock Wallet First"
                : sending
                ? "Sending..."
                : `Send ${selectedAsset}`}
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

        {isUnlocked ? (
          <div className="mt-3 space-y-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-yellow-200">
                Backup & Recovery
              </p>

              <button
                type="button"
                onClick={() => setShowSecrets((prev) => !prev)}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white"
              >
                {showSecrets ? "Hide" : "Show"}
              </button>
            </div>

            {showSecrets ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-[#06131b] p-3">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/45">
                    Private Key
                  </p>
                  <p className="break-all text-sm text-white/85">
                    {privateKey || "No private key available"}
                  </p>

                  {privateKey ? (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(privateKey)}
                      className="mt-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white"
                    >
                      Copy Private Key
                    </button>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#06131b] p-3">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/45">
                    Recovery Phrase
                  </p>
                  <p className="break-words text-sm text-white/85">
                    {mnemonic || "No recovery phrase saved for this wallet"}
                  </p>

                  {mnemonic ? (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(mnemonic)}
                      className="mt-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white"
                    >
                      Copy Recovery Phrase
                    </button>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
                  Never share your private key or recovery phrase. Store them offline in a safe place.
                </div>
              </div>
            ) : (
              <div className="text-sm text-white/70">
                Your private key and recovery phrase are hidden. Reveal only when you are ready to back them up safely.
              </div>
            )}
          </div>
        ) : null}

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
          className="rounded-full px-2 py-2 text-[10px] font-medium text-white/70"
        >
          Markets
        </Link>

        <Link
          href="/dashboard/swap"
          className="rounded-full px-2 py-2 text-[10px] font-medium text-white/70"
        >
          Swap
        </Link>

        <Link
          href="/dashboard/wallet"
          className="rounded-full bg-cyan-500/90 px-2 py-2 text-[10px] font-medium text-[#031019]"
        >
          Wallet
        </Link>
      </div>

      <div className="mt-6">
        <TronWalletCard />
      </div>

      {showAuthPrompt && (
        <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4">
          <p className="mb-3 text-sm font-semibold text-amber-200">
            CryptoHost Secure Auth
          </p>

          <input
            type="password"
            value={transactionPin}
            onChange={(e) => setTransactionPin(e.target.value)}
            placeholder="Enter 6-digit Transaction PIN"
            className="w-full rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none"
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleVerifyTransactionPin}
              className="flex-1 rounded-2xl border border-cyan-400/25 bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-100"
            >
              Verify & Send
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAuthPrompt(false);
                setTransactionPin("");
                setPendingSend(false);
              }}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <SupportChatbot />
    </div>
  );
}