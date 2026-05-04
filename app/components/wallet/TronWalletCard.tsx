"use client";

import { useEffect, useState } from "react";

export default function TronWalletCard() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const saved = "TYuHJPv4xVLaSBEj4RUNViNCLUVqJVvWaQ";

    if (!saved) {
      setStatus("No TRON wallet found.");
      return;
    }

    setAddress(saved);
  }, []);

  async function copy() {
    if (!address) return;

    await navigator.clipboard.writeText(address);
    setStatus("Copied.");
  }

  async function handleSendTron() {
    try {
      setSending(true);
      setStatus("Sending...");

      const privateKey =
        localStorage.getItem("privateKey") || "";

      if (!privateKey) {
        setStatus("No wallet key.");
        return;
      }

      if (!recipient) {
        setStatus("Enter recipient.");
        return;
      }

      if (!amount || Number(amount) <= 0) {
        setStatus("Enter valid amount.");
        return;
      }

      const res = await fetch(
        "/api/tron/send-tron",
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

      const data = await res.json();

      if (!res.ok) {
        setStatus(
          data.error || "Send failed"
        );
        return;
      }

      setStatus("Success!");

      setRecipient("");
      setAmount("");

    } catch {
      setStatus("Request failed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-3xl bg-zinc-950 border border-white/10 p-5 mt-5">
      {/* RECEIVE */}
      <p className="text-sm text-zinc-400 mb-2">
        TRON Wallet
      </p>

      <p className="text-xs break-all mb-4">
        {address || "No wallet"}
      </p>

      <button
        onClick={copy}
        className="w-full rounded-2xl bg-cyan-500 py-3 text-black font-bold mb-4"
      >
        Copy Address
      </button>

      {/* SEND */}
      <div className="space-y-3">
        <input
          type="text"
          value={recipient}
          onChange={(e) =>
            setRecipient(e.target.value)
          }
          placeholder="Recipient Address"
          className="w-full rounded-2xl bg-zinc-900 border border-white/10 px-4 py-3 text-sm text-white"
        />

        <input
          type="text"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          placeholder="Amount (USDT TRC20)"
          className="w-full rounded-2xl bg-zinc-900 border border-white/10 px-4 py-3 text-sm text-white"
        />

        <button
          onClick={handleSendTron}
          disabled={sending}
          className="w-full rounded-2xl bg-cyan-500 py-3 text-sm font-bold text-black disabled:opacity-50"
        >
          {sending
            ? "Sending..."
            : "Send TRON"}
        </button>
      </div>

      {/* STATUS */}
      {status && (
        <p className="text-xs text-zinc-400 mt-4 break-all">
          {status}
        </p>
      )}
    </div>
  );
}