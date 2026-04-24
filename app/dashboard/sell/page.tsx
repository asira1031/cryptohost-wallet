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
    USDT: 0,
    BNB: 0,
    TRX: 0,
  });

  const serviceFeePercent = 2.0;

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,binancecoin,tron&vs_currencies=usd",
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error("Failed to fetch live prices");

        const data = await res.json();

        setPrices({
          ETH: Number(data?.ethereum?.usd ?? 0),
          USDT: Number(data?.tether?.usd ?? 0),
          BNB: Number(data?.binancecoin?.usd ?? 0),
          TRX: Number(data?.tron?.usd ?? 0),
        });
      } catch (err) {
        console.error("Failed to fetch prices:", err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const amountValue = Number(assetAmount) || 0;
  const currentPrice = prices[asset] || 0;
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

  // 🔥 SELL REDIRECT LOGIC
  function buildSellUrl() {
    const amount = amountValue > 0 ? String(amountValue) : "100";

    const url = new URL("https://global.transak.com");

    url.searchParams.set("fiatCurrency", "USD");
    url.searchParams.set("cryptoCurrencyCode", asset);
    url.searchParams.set("cryptoAmount", amount);
    url.searchParams.set("isBuyOrSell", "SELL");

    return url.toString();
  }

  function handleSell() {
    const url = buildSellUrl();
    window.open(url, "_blank", "noopener,noreferrer");
  }

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
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white/80 hover:bg-white/15"
          >
            Back
          </Link>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-orange-400/15 bg-[#071923]/90 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="border-b border-white/10 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-orange-300/75">
              Sell Panel
            </p>
            <p className="mt-2 text-sm text-white/72">
              Select the asset you want to sell and review your payout.
            </p>
          </div>

          <div className="space-y-4 p-4">
            <div className="rounded-[28px] border border-white/10 bg-[#06131b]/95 p-4">
              <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-white/45">
                Choose Asset
              </p>

              <div className="grid grid-cols-4 gap-2">
                {(["ETH", "USDT", "BNB", "TRX"] as SellAsset[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => setAsset(item)}
                    className={`rounded-2xl px-3 py-3 text-sm font-semibold ${
                      asset === item
                        ? "border border-orange-400/30 bg-orange-500/20 text-orange-200"
                        : "border border-white/10 bg-white/[0.04] text-white/75"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#06131b]/95 p-4">
              <label className="mb-3 block text-[11px] uppercase text-white/45">
                Enter {asset} Amount
              </label>

              <input
                value={assetAmount}
                onChange={(e) => setAssetAmount(e.target.value)}
                placeholder="100"
                className="w-full rounded-2xl border border-white/10 bg-[#031019] px-4 py-3 text-sm text-white"
              />

              <div className="mt-3 grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setAssetAmount(String(amount))}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/80"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-orange-400/15 bg-gradient-to-br from-orange-500/12 to-[#06131b] p-4">
              <div className="flex justify-between mb-2">
                <span>Market Price</span>
                <span>{formattedMarketPrice}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span>Sell Amount</span>
                <span>{amountValue} {asset}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span>Gross Value</span>
                <span>${grossValue.toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span>Service Fee ({serviceFeePercent}%)</span>
                <span>${serviceFeeAmount.toFixed(2)}</span>
              </div>

              <div className="text-center mt-4 text-2xl font-bold">
                ${formattedEstimatedPayout}
              </div>
            </div>

            <button
              onClick={handleSell}
              className="w-full rounded-2xl bg-orange-500 py-3 text-white font-semibold"
            >
              Continue to Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}