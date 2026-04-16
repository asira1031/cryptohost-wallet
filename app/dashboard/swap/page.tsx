"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Asset = "ETH" | "USDT" | "BNB";

const SWAP_FEE_PERCENT = 1; // ✅ your platform fee

export default function SwapPage() {
  const [from, setFrom] = useState<Asset>("ETH");
  const [to, setTo] = useState<Asset>("USDT");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [message, setMessage] = useState("");

  const mapId = (asset: Asset) => {
    if (asset === "ETH") return "ethereum";
    if (asset === "BNB") return "binancecoin";
    return "tether";
  };

  useEffect(() => {
    const loadPrice = async () => {
      setLoadingPrice(true);
      setMessage("");

      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${mapId(
            from
          )}&vs_currencies=usd`
        );

        if (!res.ok) {
          throw new Error("Failed to load price");
        }

        const data = await res.json();
        const usd = data?.[mapId(from)]?.usd;

        setPrice(typeof usd === "number" ? usd : null);
      } catch (error) {
        console.error(error);
        setPrice(null);
        setMessage("Unable to load live price right now.");
      } finally {
        setLoadingPrice(false);
      }
    };

    void loadPrice();
  }, [from]);

  const numericAmount = useMemo(() => {
    const parsed = Number(amount);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [amount]);

  const grossUsdValue = useMemo(() => {
    if (!price || numericAmount <= 0) return 0;
    return numericAmount * price;
  }, [numericAmount, price]);

  const feeUsdValue = useMemo(() => {
    if (grossUsdValue <= 0) return 0;
    return (grossUsdValue * SWAP_FEE_PERCENT) / 100;
  }, [grossUsdValue]);

  const netUsdValue = useMemo(() => {
    if (grossUsdValue <= 0) return 0;
    return grossUsdValue - feeUsdValue;
  }, [grossUsdValue, feeUsdValue]);

  const estimate = grossUsdValue > 0 ? grossUsdValue.toFixed(2) : "0.00";
  const feeDisplay = feeUsdValue > 0 ? feeUsdValue.toFixed(2) : "0.00";
  const netDisplay = netUsdValue > 0 ? netUsdValue.toFixed(2) : "0.00";

  const handleSwitch = () => {
    setFrom(to);
    setTo(from);
    setMessage("");
  };

  const handleSwap = () => {
    setMessage("");

    if (!amount || numericAmount <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }

    if (from === to) {
      setMessage("Choose different assets to swap.");
      return;
    }

    setMessage(
      `Swap prepared: ${numericAmount} ${from} → ${to}. Gross value: $${estimate}. Your platform fee (${SWAP_FEE_PERCENT}%): $${feeDisplay}. Net value after fee: $${netDisplay}.`
    );
  };

  return (
    <div className="min-h-screen bg-[#06121f] px-6 py-10 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-cyan-900/40 bg-[#071b2b] p-8 shadow-2xl">
        <h1 className="mb-6 text-2xl font-semibold">Swap</h1>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-gray-400">From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value as Asset)}
              className="w-full rounded-xl bg-[#0a1730] p-3 outline-none"
            >
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="BNB">BNB</option>
            </select>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSwitch}
              className="rounded-full border border-white/10 bg-[#0a1730] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#102042]"
            >
              ⇅ Switch
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">To</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value as Asset)}
              className="w-full rounded-xl bg-[#0a1730] p-3 outline-none"
            >
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="BNB">BNB</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-xl bg-[#0a1730] p-3 outline-none"
            />
          </div>

          <div className="rounded-xl bg-[#0a1730] p-3 text-sm text-gray-300 space-y-2">
            <div>
              Live Price:{" "}
              <b>
                {loadingPrice
                  ? "Loading..."
                  : price !== null
                  ? `$${price}`
                  : "Unavailable"}
              </b>
            </div>

            <div>
              Gross Estimated Value: <b>${estimate}</b>
            </div>

            <div>
              Platform Fee ({SWAP_FEE_PERCENT}%): <b>${feeDisplay}</b>
            </div>

            <div>
              Net Value After Fee: <b>${netDisplay}</b>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="w-full rounded-xl bg-cyan-600 p-3 font-semibold transition hover:bg-cyan-500"
          >
            Swap
          </button>

          {message ? (
            <div className="rounded-xl border border-white/10 bg-[#0a1730] p-3 text-sm text-white/85">
              {message}
            </div>
          ) : null}
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-cyan-400">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}