"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadEvmWallet } from "@/app/lib/wallet/evmWallet";

export default function SendBnbPage() {
  const router = useRouter();

  const [walletAddress, setWalletAddress] =
    useState("");

  const [to, setTo] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [status, setStatus] =
    useState("");

  useEffect(() => {
    const saved =
      loadEvmWallet();

    if (saved?.address) {
      setWalletAddress(
        saved.address
      );
    }
  }, []);

  async function handleSend() {
    try {
      setSending(true);
      setStatus("");

      const saved =
        loadEvmWallet();

      if (
        !saved?.privateKey
      ) {
        setStatus(
          "No wallet key found."
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
            to,
            amount,
            privateKey:
              saved.privateKey,
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
      } else {
        setStatus(
          `Success: ${data.hash}`
        );
        setTo("");
        setAmount("");
      }
    } catch {
      setStatus(
        "Request failed."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8 flex justify-center">
      <div className="w-full max-w-md">

        <div className="rounded-3xl bg-zinc-950 border border-white/10 p-5">

          <p className="text-2xl font-bold text-yellow-400 mb-4">
            Send BNB
          </p>

          <p className="text-xs break-all mb-4 text-zinc-400">
            {walletAddress ||
              "No wallet"}
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
            placeholder="Amount BNB"
            className="w-full rounded-2xl bg-black p-4 mb-3"
          />

          <button
            onClick={
              handleSend
            }
            disabled={sending}
            className="w-full rounded-2xl bg-yellow-400 py-4 text-black font-bold disabled:opacity-50"
          >
            {sending
              ? "Sending..."
              : "Send BNB"}
          </button>

          {status && (
            <p className="text-xs text-zinc-400 mt-4 break-all">
              {status}
            </p>
          )}

        </div>
      </div>
    </main>
  );
}