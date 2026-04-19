"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type BuyAsset = "ETH" | "USDT" | "BNB" | "TRX";

const PRICE_MAP: Record<BuyAsset, number> = {
  ETH: 3200,
  USDT: 1,
  BNB: 600,
  TRX: 0.12,
};

export default function BuyPage() {
  const [asset, setAsset] = useState<BuyAsset>("USDT");
  const [usdAmount, setUsdAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card / Bank");
  const feePercent = 2.5;

  const usdValue = Number(usdAmount) || 0;
  const feeAmount = usdValue * (feePercent / 100);
  const netUsd = Math.max(usdValue - feeAmount, 0);
  const estimatedReceive = netUsd / PRICE_MAP[asset];

  const quickAmounts = [50, 100, 250, 500];

  const formattedReceive = useMemo(() => {
    if (!estimatedReceive) return "0";
    return estimatedReceive.toLocaleString(undefined, {
      maximumFractionDigits: asset === "USDT" || asset === "TRX" ? 2 : 6,
    });
  }, [estimatedReceive, asset]);

  return (
    <div className="min-h-screen bg-[#031019] px-4 py-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/70">
              CryptoHost Wallet
            </p>
            <h1 className="text-2xl font-bold">Buy Crypto</h1>
          </div>

          <Link
            href="/dashboard/wallet"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white/80"
          >
            Back
          </Link>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-emerald-400/15 bg-[#071923]/95 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="border-b border-white/10 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/70">
              Buy Panel
            </p>
            <p className="mt-1 text-sm text-white/70">
              Select asset, enter amount, and review estimate.
            </p>
          </div>

          <div className="space-y-4 p-4">
            <div className="rounded-3xl border border-white/10 bg-[#06131b] p-4">
              <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
                Choose Asset
              </p>

              <div className="grid grid-cols-4 gap-2">
                {(["ETH", "USDT", "BNB", "TRX"] as BuyAsset[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAsset(item)}
                    className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                      asset === item
                        ? "border border-emerald-400/30 bg-emerald-500/20 text-emerald-200"
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
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#031019] px-4 py-3 text-sm text-white outline-none"
              >
                <option>Card / Bank</option>
                <option>Wallet Balance</option>
                <option>Manual Transfer</option>
              </select>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#06131b] p-4">
              <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-white/45">
                Enter USD Amount
              </label>

              <input
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                placeholder="100"
                className="w-full rounded-2xl border border-white/10 bg-[#031019] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              />

              <div className="mt-3 grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setUsdAmount(String(amount))}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/75"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/65">Market Price</span>
                <span className="text-sm font-semibold text-white">
                  ${PRICE_MAP[asset].toLocaleString()}
                </span>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/65">Processing Fee</span>
                <span className="text-sm font-semibold text-white">
                  ${feeAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/65">Net Amount</span>
                <span className="text-sm font-semibold text-white">
                  ${netUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-200/70">
                  Estimated Receive
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-100">
                  {formattedReceive} {asset}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-2xl border border-emerald-400/25 bg-emerald-500/20 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/30"
            >
              Continue Buy
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/55">
              Preview only. You can connect real provider logic later.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}