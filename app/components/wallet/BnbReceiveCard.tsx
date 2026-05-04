"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { addHistoryItem } from "../../lib/wallet/history";
export default function BnbReceiveCard() {
  const [walletAddress, setWalletAddress] =
    useState("");

  const [bnbBalance, setBnbBalance] =
    useState("0.000000");

  const [loading, setLoading] =
    useState(false);

  const [status, setStatus] =
    useState("");

  const [recipient, setRecipient] =
    useState("");

  const [amount, setAmount] =
    useState("");

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    const address =
      localStorage.getItem(
        "imported_wallet_address"
      ) ||
      localStorage.getItem(
        "cryptohost_main_wallet"
      ) ||
      "";

    if (!address) {
      setStatus("No wallet found.");
      return;
    }

    setWalletAddress(address);
    await fetchBnb(address);
  }

  async function fetchBnb(
    address: string
  ) {
    try {
      setLoading(true);
      setStatus(
        "Refreshing BNB..."
      );

      const rpc =
        process.env
          .NEXT_PUBLIC_BSC_RPC_URL ||
        "https://bsc-dataseed.binance.org";

      const provider =
        new ethers.JsonRpcProvider(
          rpc
        );

      const raw =
        await provider.getBalance(
          address
        );

      setBnbBalance(
        Number(
          ethers.formatEther(raw)
        ).toFixed(6)
      );

      setStatus(
        "BNB balance refreshed."
      );
    } catch {
      setStatus(
        "Failed to load BNB."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyAddress() {
    if (!walletAddress) return;

    await navigator.clipboard.writeText(
      walletAddress
    );

    setStatus(
      "Wallet address copied."
    );
  }

  async function handleSendBnb() {
    try {
      setLoading(true);
      setStatus("Sending BNB...");

      const privateKey =
        localStorage.getItem(
          "privateKey"
        ) || "";

      if (!privateKey) {
        setStatus(
          "No wallet key found."
        );
        return;
      }

      if (!recipient) {
        setStatus(
          "Enter recipient."
        );
        return;
      }

      if (
        !amount ||
        Number(amount) <= 0
      ) {
        setStatus(
          "Enter valid amount."
        );
        return;
      }

      const res = await fetch(
        "/api/send-bnb",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            to: recipient,
            amount,
            privateKey,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        setStatus(
          data.error ||
            "Send failed."
        );
        return;
      }

      addHistoryItem({
  hash: data.hash,
  network: "bsc",
  type: "send",
  assetSymbol: "BNB",
  amount: amount,
  to: recipient,
  from: walletAddress,
  status: "confirmed",
  timestamp: Date.now(),
  explorerUrl:
    "https://bscscan.com/tx/" +
    data.hash,
});

setStatus(
  "Success: " +
  data.hash
);

      setRecipient("");
      setAmount("");

      await fetchBnb(
        walletAddress
      );
    } catch {
      setStatus(
        "Request failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-zinc-950 border border-white/10 p-5 mt-5">
      <p className="text-sm text-zinc-400 mb-2">
        BNB Receive
      </p>

      <p className="text-2xl font-bold text-yellow-400 mb-3">
        {bnbBalance} BNB
      </p>

      <p className="text-xs text-zinc-400 mb-2">
        BEP20 Wallet Address
      </p>

      <p className="text-xs break-all mb-4">
        {walletAddress ||
          "No wallet"}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={copyAddress}
          className="rounded-2xl bg-zinc-800 py-3 text-sm"
        >
          Copy Address
        </button>

        <button
          onClick={() =>
            fetchBnb(
              walletAddress
            )
          }
          disabled={
            loading ||
            !walletAddress
          }
          className="rounded-2xl bg-yellow-400 py-3 text-sm text-black font-bold disabled:opacity-50"
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <input
          type="text"
          value={recipient}
          onChange={(e) =>
            setRecipient(
              e.target.value
            )
          }
          placeholder="Recipient Address"
          className="w-full rounded-2xl bg-zinc-900 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
        />

        <input
          type="text"
          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
          placeholder="Amount BNB"
          className="w-full rounded-2xl bg-zinc-900 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
        />

        <button
          type="button"
          onClick={
            handleSendBnb
          }
          disabled={loading}
          className="w-full rounded-2xl bg-yellow-400 py-3 text-sm font-bold text-black disabled:opacity-50"
        >
          {loading
            ? "Sending..."
            : "Send BNB"}
        </button>
      </div>

      {status && (
        <p className="text-xs text-zinc-400 mt-4 break-all">
          {status}
        </p>
      )}
    </div>
  );
}