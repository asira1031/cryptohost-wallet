"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Asset = "ETH" | "USDT" | "BNB";

export default function SwapPage() {
  const [from, setFrom] = useState<Asset>("ETH");
  const [to, setTo] = useState<Asset>("USDT");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState<number | null>(null);

  // 🔗 Map asset to CoinGecko ID
  const mapId = (a: Asset) => {
    if (a === "ETH") return "ethereum";
    if (a === "BNB") return "binancecoin";
    return "tether";
  };

  // 📊 Load price
  useEffect(() => {
    const loadPrice = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${mapId(
            from
          )}&vs_currencies=usd`
        );
        const data = await res.json();
        const usd = data?.[mapId(from)]?.usd;
        setPrice(typeof usd === "number" ? usd : null);
      } catch {
        setPrice(null);
      }
    };

    loadPrice();
  }, [from]);

  // 💰 Estimate value
  const estimate =
    price && amount ? (Number(amount) * price).toFixed(2) : "0.00";

  // 🔄 Swap handler (SAFE SIMULATION)
  const handleSwap = () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (from === to) {
      alert("Cannot swap same asset");
      return;
    }

    alert(
      `Swap executed:\n${amount} ${from} → approx $${estimate} value in ${to}`
    );
  };

  return (
    <div className="min-h-screen bg-[#06121f] px-6 py-10 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-cyan-900/40 bg-[#071b2b] p-8 shadow-2xl">
        <h1 className="mb-6 text-2xl font-semibold">Swap</h1>

        <div className="space-y-4">
          {/* FROM */}
          <div>
            <label className="text-sm text-gray-400">From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value as Asset)}
              className="w-full rounded-xl bg-[#0a1730] p-3"
            >
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="BNB">BNB</option>
            </select>
          </div>

          {/* TO */}
          <div>
            <label className="text-sm text-gray-400">To</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value as Asset)}
              className="w-full rounded-xl bg-[#0a1730] p-3"
            >
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="BNB">BNB</option>
            </select>
          </div>

          {/* AMOUNT */}
          <div>
            <label className="text-sm text-gray-400">Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-xl bg-[#0a1730] p-3"
            />
          </div>

          {/* ESTIMATE */}
          <div className="rounded-xl bg-[#0a1730] p-3 text-sm text-gray-300">
            Estimated Value: <b>${estimate}</b>
          </div>

          {/* SWAP BUTTON */}
          <button
            onClick={handleSwap}
            className="w-full rounded-xl bg-cyan-600 p-3 font-semibold hover:bg-cyan-500 transition"
          >
            Swap
          </button>
        </div>

        {/* BACK */}
        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-cyan-400">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}