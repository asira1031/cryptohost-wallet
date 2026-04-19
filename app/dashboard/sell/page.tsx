"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SellAsset = "ETH" | "USDT" | "BNB" | "TRX";

const PRICE_MAP: Record<SellAsset, number> = {
  ETH: 3200,
  USDT: 1,
  BNB: 600,
  TRX: 0.12,
};

export default function SellPage() {
  const [asset, setAsset] = useState<SellAsset>("USDT");
  const [assetAmount, setAssetAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("Bank / Card");
  const feePercent = 2.0;

  const amountValue = Number(assetAmount) || 0;
  const grossUsd = amountValue * PRICE_MAP[asset];
  const feeAmount = grossUsd * (feePercent / 100);
  const estimatedPayout = Math.max(grossUsd - feeAmount, 0);

  const quickAmounts = [25, 50, 100, 250];

  const formattedPayout = useMemo(() => {
    return estimatedPayout.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }, [estimatedPayout]);

  return (
    <div className="min-h-screen bg-[#031019] px-4 py-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-orange-300/70">
              CryptoHost Wallet
            </p>
            <h1 className="text-2xl font-bold">Sell Crypto</h1>
          </div>

          <Link
            href="/dashboard/wallet"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white/80"
          >
            Back
          </Link>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-orange-400/15 bg-[#071923]/95 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="border-b border-white/10 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
              Sell Panel
            </p>
            <p className="mt-1 text-sm text-white/70">
              Review your estimated payout before continuing.
            </p>
          </div>

          <div className="space-y-4 p-4">
            <div className="rounded-3xl border border-white/10 bg-[#06131b] p-4">
              <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
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
                        ? "border border-orange-400/30 bg-orange-500/20 text-orange-200"
                        : "border border-white/10 bg-white/5 text-white/70"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#06131b] p-4">
              <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-white/45">
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

            <div className="rounded-3xl border border-white/10 bg-[#06131b] p-4">
              <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-white/45">
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
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/75"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-orange-400/15 bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/65">Market Price</span>
                <span className="text-sm font-semibold text-white">
                  ${PRICE_MAP[asset].toLocaleString()}
                </span>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/65">Gross Value</span>
                <span className="text-sm font-semibold text-white">
                  ${grossUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/65">Processing Fee</span>
                <span className="text-sm font-semibold text-white">
                  ${feeAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-orange-200/70">
                  Estimated Payout
                </p>
                <p className="mt-2 text-2xl font-bold text-orange-100">
                  ${formattedPayout}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-2xl border border-orange-400/25 bg-orange-500/20 px-4 py-3 text-sm font-semibold text-orange-100 transition hover:bg-orange-500/30"
            >
              Continue Sell
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/55">
              Preview only. Real settlement or payout logic can be connected later.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}