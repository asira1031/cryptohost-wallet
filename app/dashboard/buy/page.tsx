"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BuyAsset = "ETH" | "USDT" | "BNB" | "TRX";
type Provider = "MoonPay" | "Transak" | "Binance";

const ASSETS: BuyAsset[] = ["ETH", "USDT", "BNB", "TRX"];

const quickAmounts = [50, 100, 250, 500];

export default function BuyPage() {
  const [asset, setAsset] = useState<BuyAsset>("USDT");
  const [usdAmount, setUsdAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card / Bank");
  const [provider, setProvider] = useState<Provider>("MoonPay");

  const [prices, setPrices] = useState<Record<BuyAsset, number>>({
    ETH: 0,
    USDT: 1,
    BNB: 0,
    TRX: 0,
  });

  const serviceFeePercent = 2.5;

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

    void fetchPrices();
    const interval = setInterval(() => void fetchPrices(), 30000);

    return () => clearInterval(interval);
  }, []);

  const usdValue = Number(usdAmount) || 0;
  const serviceFeeAmount = usdValue * (serviceFeePercent / 100);
  const totalToPay = usdValue + serviceFeeAmount;
  const currentPrice = prices[asset] || 0;
  const estimatedReceive = currentPrice > 0 ? usdValue / currentPrice : 0;

  const formattedReceive = useMemo(() => {
    if (!estimatedReceive) return "0";
    return estimatedReceive.toLocaleString(undefined, {
      maximumFractionDigits: asset === "USDT" || asset === "TRX" ? 2 : 6,
    });
  }, [estimatedReceive, asset]);

  const formattedMarketPrice = useMemo(() => {
    if (!currentPrice) return "Loading...";
    return `$${currentPrice.toLocaleString(undefined, {
      maximumFractionDigits: currentPrice < 1 ? 4 : 2,
    })}`;
  }, [currentPrice]);

  function buildRedirectUrl() {
    const amount = usdValue > 0 ? String(usdValue) : "100";

    if (provider === "MoonPay") {
      const url = new URL("https://buy.moonpay.com");
      url.searchParams.set("currencyCode", asset.toLowerCase());
      url.searchParams.set("baseCurrencyCode", "usd");
      url.searchParams.set("baseCurrencyAmount", amount);
      return url.toString();
    }

    if (provider === "Transak") {
      const url = new URL("https://global.transak.com");
      url.searchParams.set("fiatCurrency", "USD");
      url.searchParams.set("fiatAmount", amount);
      url.searchParams.set("cryptoCurrencyCode", asset);
      url.searchParams.set("isBuyOrSell", "BUY");
      return url.toString();
    }

    const url = new URL("https://www.binance.com/en/buy-sell-crypto");
    url.searchParams.set("type", "BUY");
    url.searchParams.set("crypto", asset);
    url.searchParams.set("fiat", "USD");
    url.searchParams.set("amount", amount);
    return url.toString();
  }

  function handleContinue() {
    const url = buildRedirectUrl();
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b2a36_0%,_#031019_45%,_#020b12_100%)] px-4 py-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-300/70">
              CryptoHost Wallet
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
              Buy Crypto
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Buy digital assets through trusted payment providers
            </p>
          </div>

          <Link
            href="/dashboard/wallet"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white/80 transition hover:bg-white/15"
          >
            Back
          </Link>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-emerald-400/15 bg-[#071923]/90 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/75">
              Buy Panel
            </p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Select asset, provider, funding source, and amount.
            </p>
          </div>

          <div className="space-y-4 p-4">
            <div className="rounded-[28px] border border-white/10 bg-[#06131b]/95 p-4">
              <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-white/45">
                Choose Asset
              </p>

              <div className="grid grid-cols-4 gap-2">
                {ASSETS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAsset(item)}
                    className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                      asset === item
                        ? "border border-emerald-400/30 bg-emerald-500/20 text-emerald-200"
                        : "border border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.07]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#06131b]/95 p-4">
              <label className="mb-3 block text-[11px] uppercase tracking-[0.28em] text-white/45">
                Provider
              </label>

              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as Provider)}
                className="w-full rounded-2xl border border-white/10 bg-[#031019] px-4 py-3 text-sm text-white outline-none"
              >
                <option>MoonPay</option>
                <option>Transak</option>
                <option>Binance</option>
              </select>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#06131b]/95 p-4">
              <label className="mb-3 block text-[11px] uppercase tracking-[0.28em] text-white/45">
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

            <div className="rounded-[28px] border border-white/10 bg-[#06131b]/95 p-4">
              <label className="mb-3 block text-[11px] uppercase tracking-[0.28em] text-white/45">
                Enter USD Amount
              </label>

              <input
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                placeholder="100"
                inputMode="decimal"
                className="w-full rounded-2xl border border-white/10 bg-[#031019] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              />

              <div className="mt-3 grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setUsdAmount(String(amount))}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.08]"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-emerald-400/15 bg-gradient-to-br from-emerald-500/12 via-cyan-500/8 to-[#06131b] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/65">Market Price</span>
                <span className="text-sm font-semibold text-white">
                  {formattedMarketPrice}
                </span>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/65">Buy Amount</span>
                <span className="text-sm font-semibold text-white">
                  ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/65">
                  Service Fee ({serviceFeePercent}%)
                </span>
                <span className="text-sm font-semibold text-white">
                  ${serviceFeeAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-white/65">Total To Pay</span>
                <span className="text-sm font-semibold text-white">
                  ${totalToPay.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 px-4 py-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/75">
                  Estimated Receive
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-100">
                  {formattedReceive} {asset}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="w-full rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-500/30 to-cyan-500/20 px-4 py-3.5 text-sm font-semibold text-emerald-50 transition hover:from-emerald-500/40 hover:to-cyan-500/30"
            >
              Continue with {provider}
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs leading-5 text-white/55">
              You will be redirected to {provider} to complete payment and verification.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}