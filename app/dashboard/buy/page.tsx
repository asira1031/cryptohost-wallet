"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BuyAsset = "ETH" | "USDT" | "BNB" | "TRX";
type Provider = "MoonPay" | "Transak" | "Binance";

const ASSETS: BuyAsset[] = ["ETH", "USDT", "BNB", "TRX"];
const MAX_BUY_USD = 900; // ≈ ₱50,000

export default function BuyPage() {
  const [asset, setAsset] = useState<BuyAsset>("USDT");
  const [usdAmount, setUsdAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card / Bank");
  const [provider, setProvider] = useState<Provider>("MoonPay");

  const [prices, setPrices] = useState<Record<BuyAsset, number>>({
    ETH: 0,
    USDT: 0,
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

        const data = await res.json();

        setPrices({
          ETH: Number(data?.ethereum?.usd ?? 0),
          USDT: Number(data?.tether?.usd ?? 0),
          BNB: Number(data?.binancecoin?.usd ?? 0),
          TRX: Number(data?.tron?.usd ?? 0),
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const usdValue = Number(usdAmount) || 0;
  const serviceFeeAmount = usdValue * (serviceFeePercent / 100);
  const totalToPay = usdValue + serviceFeeAmount;
  const currentPrice = prices[asset] || 0;
  const estimatedReceive = currentPrice > 0 ? usdValue / currentPrice : 0;

  const formattedReceive = useMemo(() => {
    return estimatedReceive.toLocaleString(undefined, {
      maximumFractionDigits: asset === "USDT" ? 2 : 6,
    });
  }, [estimatedReceive, asset]);

  const formattedMarketPrice = useMemo(() => {
    if (!currentPrice) return "Loading...";
    return `$${currentPrice.toFixed(2)}`;
  }, [currentPrice]);

  // 🔥 Silent Order System
  function createOrder() {
    const order = {
      id: "ORD-" + Date.now(),
      asset,
      amount: usdAmount,
      method: paymentMethod,
      provider,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("last_order", JSON.stringify(order));
  }

  function buildRedirectUrl() {
    const amount = usdValue > 0 ? String(usdValue) : "100";

    if (provider === "MoonPay") {
      const url = new URL("https://buy.moonpay.com");
      url.searchParams.set("currencyCode", asset.toLowerCase());
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

    return "https://www.binance.com/en/buy-sell-crypto";
  }

  function handleContinue() {
    if (usdValue > MAX_BUY_USD) {
      alert("Max buy is ₱50,000 only");
      return;
    }

    createOrder(); // 🔥 silent order
    const url = buildRedirectUrl();
    window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen px-4 py-5 text-white">
      <div className="mx-auto max-w-md">

        <h1 className="text-2xl font-bold mb-4">Buy Crypto</h1>

        {/* Asset */}
        <div className="mb-4">
          {ASSETS.map((item) => (
            <button
              key={item}
              onClick={() => setAsset(item)}
              className={`mr-2 px-3 py-2 ${
                asset === item ? "bg-green-500" : "bg-gray-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Provider */}
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as Provider)}
          className="w-full mb-3 p-2 bg-black"
        >
          <option>MoonPay</option>
          <option>Transak</option>
          <option>Binance</option>
        </select>

        {/* Payment */}
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full mb-3 p-2 bg-black"
        >
          <option>Card / Bank</option>
          <option>GCash — Philippines</option>
          <option>Maya — Philippines</option>
        </select>

        {(paymentMethod.includes("GCash") ||
          paymentMethod.includes("Maya")) && (
          <div className="text-xs mb-3 text-yellow-300">
            Payment will be processed via partner provider.
          </div>
        )}

        {/* Amount */}
        <input
          value={usdAmount}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val > MAX_BUY_USD) {
              setUsdAmount(String(MAX_BUY_USD));
            } else {
              setUsdAmount(e.target.value);
            }
          }}
          placeholder="Enter USD"
          className="w-full mb-4 p-2 bg-black"
        />

        {/* Summary */}
        <div className="mb-4">
          <div>Price: {formattedMarketPrice}</div>
          <div>Fee: ${serviceFeeAmount.toFixed(2)}</div>
          <div>Total: ${totalToPay.toFixed(2)}</div>
          <div>Receive: {formattedReceive} {asset}</div>
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-green-500 py-3"
        >
          Continue with {provider}
        </button>
      </div>
    </div>
  );
}