"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { loadEvmWallet } from "../../lib/wallet/evmWallet";

export default function SendTestPage() {
  const router = useRouter();

  const [walletAddress, setWalletAddress] =
    useState("");

  const [balance, setBalance] =
    useState("0.000000");

  const [to, setTo] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [status, setStatus] =
    useState("");

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      const savedWallet =
        loadEvmWallet();

      if (!savedWallet?.address) {
        setStatus(
          "No wallet found. Please import in Security."
        );
        return;
      }

      setWalletAddress(
        savedWallet.address
      );

      const res = await fetch(
        `/api/debug-wallet?address=${savedWallet.address}`
      );

      const data =
        await res.json();

      if (data.success) {
        setBalance(
          Number(
            data.balance || 0
          ).toFixed(6)
        );
      }
    } catch {
      setStatus(
        "Failed to load wallet."
      );
    }
  }

  async function handleSend() {
    try {
      setSending(true);
      setStatus("");

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
          "Invalid amount."
        );
        setSending(false);
        return;
      }

      const savedWallet =
        loadEvmWallet();

      if (
        !savedWallet?.privateKey
      ) {
        router.push(
          "/dashboard/security"
        );
        return;
      }

      const res = await fetch(
        "/api/send",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            {
              asset: "ETH",
              to,
              amount,
              privateKey:
                savedWallet.privateKey,
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
        `Success!
Main Tx: ${
          data.mainTx ||
          data.hash
        }
Fee Tx: ${
          data.feeTx ||
          "None"
        }`
      );

      setTo("");
      setAmount("");

      await loadWallet();

      setSending(false);
    } catch {
      setStatus(
        "Failed to fetch."
      );
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8 flex justify-center">
      <div className="w-full max-w-md">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-400">
            Send Test
          </h1>

          <button
            onClick={() =>
              router.push(
                "/dashboard/wallet"
              )
            }
            className="rounded-xl bg-zinc-900 px-4 py-2"
          >
            Back
          </button>
        </div>

        <div className="rounded-3xl bg-zinc-950 border border-white/10 p-5 mb-5">
          <p className="text-sm text-zinc-400">
            Wallet
          </p>

          <p className="text-xs break-all mt-2">
            {walletAddress ||
              "No wallet"}
          </p>

          <p className="mt-3 text-3xl font-bold text-amber-400">
            {balance} ETH
          </p>
        </div>

        <div className="rounded-3xl bg-zinc-950 border border-white/10 p-5">

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
            placeholder="Amount ETH"
            className="w-full rounded-2xl bg-black p-4 mb-3"
          />

          <button
            onClick={
              handleSend
            }
            disabled={sending}
            className="w-full rounded-2xl bg-amber-500 py-4 text-black font-bold disabled:opacity-50"
          >
            {sending
              ? "Sending..."
              : "Send ETH"}
          </button>

          {status && (
            <p className="text-xs text-zinc-400 mt-4 whitespace-pre-line break-all">
              {status}
            </p>
          )}
        </div>

      </div>
    </main>
  );
}