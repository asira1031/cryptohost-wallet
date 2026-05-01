"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { loadEvmWallet } from "../../lib/wallet/evmWallet";

export default function CleanSendCard() {
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
    <div className="rounded-3xl bg-zinc-950 border border-white/10 p-5">
      <p className="text-sm text-zinc-400 mb-3">
        Clean Send
      </p>

      <p className="text-xs break-all mb-3">
        {walletAddress ||
          "No wallet"}
      </p>

      <p className="text-2xl font-bold text-amber-400 mb-4">
        {balance} ETH
      </p>

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
  );
}