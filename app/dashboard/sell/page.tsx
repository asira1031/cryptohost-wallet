"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SellAsset = "ETH" | "USDT" | "BNB" | "TRX";

export default function SellPage() {
  const [asset, setAsset] = useState<SellAsset>("USDT");
  const [assetAmount, setAssetAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("Bank / Card");
  const [prices, setPrices] = useState<Record<SellAsset, number>>({
    ETH: 0,
    USDT: 1,
    BNB: 0,
    TRX: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const serviceFeePercent = 2.0;

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,binancecoin,tron&vs_currencies=usd",
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch live prices");
        }

        const data = await res.json();

        setPrices({
          ETH: Number(data?.ethereum?.usd ?? 0),
          USDT: Number(data?.tether?.usd ?? 1),
          BNB: Number(data?.binancecoin?.usd ?? 0),
          TRX: Number(data?.tron?.usd ?? 0),
        });
      } catch (err) {
        console.error("Failed to fetch prices:", err);
      }
    };

    void fetchPrices();

    const interval = setInterval(() => {
      void fetchPrices();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const amountValue = Number(assetAmount) || 0;
  const currentPrice = prices[asset] > 0 ? prices[asset] : 0;
  const grossValue = amountValue * currentPrice;
  const serviceFeeAmount = grossValue * (serviceFeePercent / 100);
  const estimatedPayout = Math.max(grossValue - serviceFeeAmount, 0);

  const quickAmounts = [25, 50, 100, 250];

  const formattedMarketPrice = useMemo(() => {
    if (!currentPrice) return "Loading...";
    return `$${currentPrice.toLocaleString(undefined, {
      maximumFractionDigits: currentPrice < 1 ? 4 : 2,
    })}`;
  }, [currentPrice]);

  const formattedEstimatedPayout = useMemo(() => {
    return estimatedPayout.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }, [estimatedPayout]);

  const handleSell = async () => {
    try {
      setSubmitting(true);

      if (!assetAmount || Number(assetAmount) <= 0) {
        alert("Please enter a valid amount.");
        return;
      }

      const res = await fetch("/api/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: assetAmount,
          asset,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Transaction failed");
      }

      alert(`Success!\nMain TX: ${data.tx1Hash}\nFee TX: ${data.tx2Hash}`);
    } catch (e) {
      console.error(e);
      alert("Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#2d1b0f_0%,_#031019_45%,_#020b12_100%)] px-4 py-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-orange-300/70">
              CryptoHost Wallet
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
              Sell Crypto
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Premium sell preview for digital assets
            </p>
          </div>

          <Link
            href="/dashboard/wallet"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white/80 transition hover:bg-white/15"
          >
            Back
          </Link>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-orange-400/15 bg-[#071923]/90 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="border-b border-white/10 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-orange-300/75">
              Sell Panel
            </p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Select the asset you want to sell and review your estimated payout.
            </p>
          </div>

          <div className="space-y-4 p-4">
            <div className="rounded-[28px] border border-white/10 bg-[#06131b]/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-white/45">
                Choose Asset
              </p>

              <div className="grid grid-cols-4 gap-2">
                {(["ETH", "USDT", "BNB", "TRX"] as SellAsset[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAsset(item)}
                    className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                      asset === item
                        ? "border border-orange-400/30 bg-orange-500/20 text-orange-200 shadow-[0_0_20px_rgba(249,115,22,0.12)]"
                        : "border border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.07]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#06131b]/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <label className="mb-3 block text-[11px] uppercase tracking-[0.28em] text-white/45">
                Payout Method
              </label>

              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#031019] px-4 py-3 text-sm text-white outline-none"
              >
                <option>Bank / Card</option>
                <option>Wallet Balance</option>
                <option>Manual Settlement</option>
              </select>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#06131b]/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <label className="mb-3 block text-[11px] uppercase tracking-[0.28em] text-white/45">
                Enter {asset} Amount
              </label>

              <input
                value={assetAmount}
                onChange={(e) => setAssetAmount(e.target.value)}
                placeholder={asset === "USDT" ? "100" : "0.5"}
                className="w-full rounded-2xl border border-white/10 bg-[#031019] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              />

              <div className="mt-3 grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setAssetAmount(String(amount))}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.08]"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-orange-400/15 bg-gradient-to-br from-orange-500/12 via-amber-500/8 to-[#06131b] p-4 shadow-[0_0_30px_rgba(249,115,22,0.08)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/65">Market Price</span>
                <span className="text-sm font-semibold text-white">
                  {formattedMarketPrice}
                </span>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/65">Sell Amount</span>
                <span className="text-sm font-semibold text-white">
                  {amountValue.toLocaleString(undefined, {
                    maximumFractionDigits:
                      asset === "USDT" || asset === "TRX" ? 2 : 6,
                  })}{" "}
                  {asset}
                </span>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/65">Gross Value</span>
                <span className="text-sm font-semibold text-white">
                  ${grossValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-white/65">
                  Service Fee ({serviceFeePercent}%)
                </span>
                <span className="text-sm font-semibold text-white">
                  ${serviceFeeAmount.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="rounded-[24px] border border-orange-400/20 bg-orange-500/10 px-4 py-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-orange-200/75">
                  Estimated Payout
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-orange-100">
                  ${formattedEstimatedPayout}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-2xl border border-orange-400/30 bg-gradient-to-r from-orange-500/30 to-amber-500/20 px-4 py-3.5 text-sm font-semibold text-orange-50 transition hover:from-orange-500/40 hover:to-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSell}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Continue Sell"}
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs leading-5 text-white/55">
              Preview only. Service fee is deducted from the estimated payout
              amount. Provider payout and settlement can be connected in the next
              phase.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}