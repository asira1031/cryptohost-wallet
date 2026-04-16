"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { getProvider } from "@/app/lib/wallet-provider";
import { unlockEncryptedWallet } from "@/app/lib/wallet-security";

type Asset = "ETH" | "USDT" | "BNB";

const SWAP_FEE_PERCENT = 1;

const TOKEN_MAP = {
  ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  BNB: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
};

export default function SwapPage() {
  const [from, setFrom] = useState<Asset>("ETH");
  const [to, setTo] = useState<Asset>("USDT");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingSwap, setLoadingSwap] = useState(false);

  const mapId = (asset: Asset) => {
    if (asset === "ETH") return "ethereum";
    if (asset === "BNB") return "binancecoin";
    return "tether";
  };

  useEffect(() => {
    const loadPrice = async () => {
      setLoadingPrice(true);
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${mapId(
            from
          )}&vs_currencies=usd`
        );
        const data = await res.json();
        setPrice(data?.[mapId(from)]?.usd || null);
      } catch {
        setPrice(null);
      } finally {
        setLoadingPrice(false);
      }
    };
    void loadPrice();
  }, [from]);

  const numericAmount = useMemo(() => Number(amount) || 0, [amount]);

  const handleSwap = async () => {
    try {
      setMessage("");
      setLoadingSwap(true);

      if (!numericAmount || numericAmount <= 0) {
        setMessage("Enter valid amount.");
        return;
      }

      if (from === to) {
        setMessage("Choose different assets.");
        return;
      }

      // 🔐 Unlock wallet (you already use this system)
      const password = prompt("Enter wallet password");
      if (!password) return;

      const wallet = await unlockEncryptedWallet(password);

      const provider = getProvider(from);
      const signer = new ethers.Wallet(wallet.privateKey, provider);

      const amountWei = ethers.parseEther(amount);

      // 🚀 CALL YOUR BACKEND
      const res = await fetch("/api/swap/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chain: from === "BNB" ? "bnb" : "eth",
          fromToken: TOKEN_MAP[from],
          toToken: TOKEN_MAP[to],
          amountWei: amountWei.toString(),
          walletAddress: wallet.address,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || "Swap failed");
      }

      const tx = await signer.sendTransaction({
        to: data.tx.to,
        data: data.tx.data,
        value: BigInt(data.tx.value || "0"),
      });

      setMessage(`Swap sent! TX: ${tx.hash}`);

      await tx.wait();

      setMessage(`✅ Swap SUCCESS\nTX: ${tx.hash}`);

    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Swap failed.");
    } finally {
      setLoadingSwap(false);
    }
  };

  const handleSwitch = () => {
    setFrom(to);
    setTo(from);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#06121f] px-6 py-10 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-cyan-900/40 bg-[#071b2b] p-8 shadow-2xl">
        <h1 className="mb-6 text-2xl font-semibold">Swap</h1>

        <div className="space-y-4">
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value as Asset)}
            className="w-full rounded-xl bg-[#0a1730] p-3"
          >
            <option>ETH</option>
            <option>USDT</option>
            <option>BNB</option>
          </select>

          <button onClick={handleSwitch}>⇅ Switch</button>

          <select
            value={to}
            onChange={(e) => setTo(e.target.value as Asset)}
            className="w-full rounded-xl bg-[#0a1730] p-3"
          >
            <option>ETH</option>
            <option>USDT</option>
            <option>BNB</option>
          </select>

          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full rounded-xl bg-[#0a1730] p-3"
          />

          <button
            onClick={handleSwap}
            disabled={loadingSwap}
            className="w-full rounded-xl bg-cyan-600 p-3"
          >
            {loadingSwap ? "Swapping..." : "Swap"}
          </button>

          {message && <div className="text-sm">{message}</div>}
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard">Back</Link>
        </div>
      </div>
    </div>
  );
}