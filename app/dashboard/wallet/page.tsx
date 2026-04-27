"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { loadEvmWallet } from "../../lib/wallet/evmWallet";
export default function DashboardPage() {
  const router = useRouter();

  const [walletAddress, setWalletAddress] =
    useState("");

  const [ethBalance, setEthBalance] =
    useState("0.000000");

  const [bnbBalance, setBnbBalance] =
    useState("0.000000");

  const [usdtBalance, setUsdtBalance] =
    useState("0.00");

  const [asset, setAsset] =
    useState("ETH");

  const [to, setTo] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [status, setStatus] =
    useState("");

  const [showReceive, setShowReceive] =
    useState(false);

  const [showBuyModal, setShowBuyModal] =
    useState(false);

  const [showSellModal, setShowSellModal] =
    useState(false);

  const SEND_FEE =
    process.env
      .NEXT_PUBLIC_SEND_FEE ||
    "1.5";

  const BUY_FEE =
    process.env
      .NEXT_PUBLIC_BUY_FEE ||
    "1.5";

  const SELL_FEE =
    process.env
      .NEXT_PUBLIC_SELL_FEE ||
    "1.5";

  useEffect(() => {
    loadWallet();
  }, []);

 async function loadWallet() {
  try {
    const imported =
      localStorage.getItem(
        "imported_wallet_address"
      ) || "";

    const mainWallet =
      localStorage.getItem(
        "cryptohost_main_wallet"
      ) || "";

    if (!mainWallet && !imported) {
      const newWallet =
        ethers.Wallet.createRandom();

      localStorage.setItem(
        "cryptohost_main_wallet",
        newWallet.address
      );

      localStorage.setItem(
        "privateKey",
        newWallet.privateKey
      );

      localStorage.setItem(
        "active_wallet",
        "main"
      );

      setWalletAddress(
        newWallet.address
      );

      setEthBalance("0.000000");
      setBnbBalance("0.000000");
      setUsdtBalance("0.00");

      return;
    }

    const active =
      localStorage.getItem(
        "active_wallet"
      ) || "main";

    const address =
      active === "imported" &&
      imported
        ? imported
        : mainWallet;

    setWalletAddress(address);

    if (!address) return;

    const ethProvider =
      new ethers.JsonRpcProvider(
        process.env
          .NEXT_PUBLIC_ETH_RPC_URL ||
          "https://ethereum.publicnode.com"
      );

    const wei =
      await ethProvider.getBalance(
        address
      );

    setEthBalance(
      Number(
        ethers.formatEther(wei)
      ).toFixed(6)
    );

    try {
      const bscProvider =
        new ethers.JsonRpcProvider(
          process.env
            .NEXT_PUBLIC_BSC_RPC_URL ||
            "https://bsc-dataseed.binance.org"
        );

      const bnbWei =
        await bscProvider.getBalance(
          address
        );

      setBnbBalance(
        Number(
          ethers.formatEther(
            bnbWei
          )
        ).toFixed(6)
      );
    } catch {}

    setUsdtBalance("0.00");
  } catch {
    setEthBalance("0.000000");
    setBnbBalance("0.000000");
  }
}
  async function handleSend() {
  try {
    setStatus("");
    setSending(true);

    if (!to || !amount) {
      setStatus(
        "Enter recipient and amount."
      );
      setSending(false);
      return;
    }

    if (
      !ethers.isAddress(to)
    ) {
      setStatus(
        "Invalid recipient address."
      );
      setSending(false);
      return;
    }

    if (
      Number(amount) <= 0
    ) {
      setStatus(
        "Enter valid amount."
      );
      setSending(false);
      return;
    }

    const savedWallet =
loadEvmWallet();

const privateKey =
savedWallet?.privateKey || "";

    if (!privateKey) {
      setStatus(
        "No wallet private key found."
      );
      setSending(false);
      return;
    }

    const res =
      await fetch(
        "/api/send",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            {
              asset,
              to,
              amount,
              privateKey,
            }
          ),
        }
      );

    const data =
      await res.json();

    if (!res.ok) {
      setStatus(
        data.error ||
          "Send failed."
      );
      setSending(false);
      return;
    }

    setStatus(
      `Sent Successfully
Main Tx: ${data.hash}
Fee Tx: ${data.feeHash}`
    );

    setTo("");
    setAmount("");

    await loadWallet();

    setSending(false);
  } catch (error: any) {
    setStatus(
      error?.message ||
        "Transaction failed."
    );

    setSending(false);
  }
}

  function openTransak() {
    window.open(
      "https://transak.com",
      "_blank"
    );
  }

  function openMoonPay() {
    window.open(
      "https://moonpay.com",
      "_blank"
    );
  }

  function openBinance() {
    window.open(
      "https://binance.com",
      "_blank"
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8 flex justify-center">
      <div className="w-full max-w-md">

        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-4xl font-bold text-amber-400">
              CryptoHost
            </h1>

            <p className="text-zinc-400">
              All-in-One Dashboard
            </p>
          </div>

          <button
            onClick={() =>
              router.push(
                "/dashboard/security"
              )
            }
            className="px-4 py-2 rounded-xl bg-zinc-900"
          >
            Security
          </button>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 p-6 text-black mb-5">
          <p className="text-sm font-medium">
            Portfolio Balance
          </p>

          <p className="text-4xl font-bold mt-2">
            {ethBalance} ETH
          </p>

          <p className="text-sm mt-1">
            {bnbBalance} BNB
          </p>

          <p className="text-sm mt-1">
            {usdtBalance} USDT
          </p>

          <p className="text-xs mt-3 break-all">
            {walletAddress}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() =>
              setShowReceive(true)
            }
            className="rounded-2xl bg-amber-500 py-4 text-black font-bold"
          >
            Receive
          </button>

          <button
            onClick={() =>
              setShowBuyModal(true)
            }
            className="rounded-2xl bg-zinc-900 py-4 font-bold"
          >
            Buy
          </button>

          <button
            onClick={() =>
              setShowSellModal(true)
            }
            className="rounded-2xl bg-zinc-900 py-4 font-bold"
          >
            Sell
          </button>

          <button
            onClick={loadWallet}
            className="rounded-2xl bg-zinc-900 py-4 font-bold"
          >
            Refresh
          </button>
        </div>

        <div className="rounded-3xl bg-zinc-950 border border-white/10 p-5 mb-5">
          <p className="text-sm text-zinc-400 mb-4">
            Send Crypto
          </p>

          <select
            value={asset}
            onChange={(e) =>
              setAsset(
                e.target.value
              )
            }
            className="w-full rounded-2xl bg-black p-4 mb-3"
          >
            <option>ETH</option>
            <option>BNB</option>
            <option>USDT</option>
          </select>

          <input
            value={to}
            onChange={(e) =>
              setTo(
                e.target.value
              )
            }
            placeholder="Recipient Address"
            className="w-full rounded-2xl bg-black p-4 mb-3"
          />

          <input
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target.value
              )
            }
            placeholder="Amount"
            className="w-full rounded-2xl bg-black p-4 mb-3"
          />

          <p className="text-xs text-zinc-400 mb-3">
            Send Fee:
            {" "}
            {SEND_FEE}%
          </p>

          <button
            onClick={
              handleSend
            }
            disabled={
              sending
            }
            className="w-full rounded-2xl bg-amber-500 py-4 text-black font-bold"
          >
            {sending
              ? "Sending..."
              : `Send ${asset}`}
          </button>

          {status && (
            <p className="text-xs text-zinc-400 mt-3 break-all">
              {status}
            </p>
          )}
        </div>

        <div className="rounded-3xl bg-zinc-950 border border-white/10 p-5">
          <p className="text-sm text-zinc-400 mb-3">
            Fees
          </p>

          <div className="flex justify-between py-2 border-b border-white/5">
            <span>
              Buy
            </span>
            <span>
              {BUY_FEE}%
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-white/5">
            <span>
              Sell
            </span>
            <span>
              {SELL_FEE}%
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span>
              Receive
            </span>
            <span>
              Free
            </span>
          </div>
        </div>
      </div>

      {showReceive && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-white/10 p-6 text-center">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              Receive
            </h2>

            <div className="bg-white p-4 rounded-2xl inline-block">
              <QRCodeSVG
                value={
                  walletAddress
                }
                size={180}
              />
            </div>

            <p className="text-xs mt-4 break-all">
              {walletAddress}
            </p>

            <button
              onClick={() =>
                setShowReceive(
                  false
                )
              }
              className="mt-5 w-full rounded-2xl bg-amber-500 py-4 text-black font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showBuyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-amber-400 text-center mb-5">
              Buy Crypto
            </h2>

            <button
              onClick={openTransak}
              className="w-full rounded-2xl bg-amber-500 py-4 text-black font-bold mb-3"
            >
              Transak
            </button>

            <button
              onClick={openMoonPay}
              className="w-full rounded-2xl bg-zinc-900 py-4 font-bold mb-3"
            >
              MoonPay
            </button>

            <button
              onClick={() =>
                setShowBuyModal(false)
              }
              className="w-full rounded-2xl bg-zinc-800 py-4"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showSellModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-amber-400 text-center mb-5">
              Sell Crypto
            </h2>

            <button
              onClick={openBinance}
              className="w-full rounded-2xl bg-amber-500 py-4 text-black font-bold mb-3"
            >
              Binance
            </button>

            <button
              onClick={() =>
                setShowSellModal(false)
              }
              className="w-full rounded-2xl bg-zinc-800 py-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}