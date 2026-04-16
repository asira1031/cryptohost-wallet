"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Coin = {
  name: string;
  symbol: string;
  price: number;
  change: number;
};

type MarketChip = "tokens" | "perps" | "stocks";

export default function MarketPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketChip, setMarketChip] = useState<MarketChip>("tokens");

  const fetchMarket = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,solana&vs_currencies=usd&include_24hr_change=true",
        { cache: "no-store" }
      );

      const data = await res.json();

      const formatted: Coin[] = [
        {
          name: "Bitcoin",
          symbol: "BTC",
          price: data.bitcoin?.usd ?? 0,
          change: data.bitcoin?.usd_24h_change ?? 0,
        },
        {
          name: "Ethereum",
          symbol: "ETH",
          price: data.ethereum?.usd ?? 0,
          change: data.ethereum?.usd_24h_change ?? 0,
        },
        {
          name: "Tether",
          symbol: "USDT",
          price: data.tether?.usd ?? 0,
          change: data.tether?.usd_24h_change ?? 0,
        },
        {
          name: "BNB",
          symbol: "BNB",
          price: data.binancecoin?.usd ?? 0,
          change: data.binancecoin?.usd_24h_change ?? 0,
        },
        {
          name: "Solana",
          symbol: "SOL",
          price: data.solana?.usd ?? 0,
          change: data.solana?.usd_24h_change ?? 0,
        },
      ];

      setCoins(formatted);
    } catch (err) {
      console.error("Market fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, []);

  const liveCards = [
    { label: "ETH", color: "from-cyan-500/30 to-cyan-500/10" },
    { label: "BNB", color: "from-teal-500/30 to-teal-500/10" },
    { label: "SOL", color: "from-fuchsia-500/30 to-fuchsia-500/10" },
  ];

  return (
    <div className="min-h-screen bg-[#02111f] px-3 py-2 text-white">
      <div className="mx-auto w-full max-w-[390px]">
        <div className="rounded-[30px] border border-cyan-500/20 bg-[radial-gradient(circle_at_top,#0c3340_0%,#071824_35%,#031019_100%)] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="mb-3 flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-medium text-white/90"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/wallet"
              className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-4 py-2 text-[11px] font-medium text-emerald-200"
            >
              Wallet
            </Link>
            <Link
              href="/dashboard/market"
              className="rounded-full border border-cyan-400/30 bg-cyan-500/20 px-4 py-2 text-[11px] font-medium text-cyan-200"
            >
              Market
            </Link>
            <Link
              href="/dashboard/history"
              className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/20 px-4 py-2 text-[11px] font-medium text-fuchsia-200"
            >
              History
            </Link>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-[#071923]/95 p-3">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-300 via-pink-400 to-rose-500" />
              <div className="flex-1 rounded-full bg-white/5 px-4 py-2 text-[11px] text-white/35">
                Search the app
              </div>
              <div className="h-7 w-7 rounded-full bg-white/8" />
            </div>

            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/75">
                  Markets • Live Route
                </p>
              </div>
              <button
                onClick={fetchMarket}
                className="rounded-full border border-cyan-400/25 bg-cyan-500/15 px-3 py-1.5 text-[10px] font-semibold text-cyan-200"
              >
                {loading ? "Loading" : "Connected"}
              </button>
            </div>

            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setMarketChip("tokens")}
                className={`rounded-full px-4 py-2 text-[11px] font-medium ${
                  marketChip === "tokens"
                    ? "bg-white text-[#0d1a24]"
                    : "bg-white/8 text-white/70"
                }`}
              >
                Tokens
              </button>
              <button
                onClick={() => setMarketChip("perps")}
                className={`rounded-full px-4 py-2 text-[11px] font-medium ${
                  marketChip === "perps"
                    ? "bg-white text-[#0d1a24]"
                    : "bg-white/8 text-white/70"
                }`}
              >
                Perps
              </button>
              <button
                onClick={() => setMarketChip("stocks")}
                className={`rounded-full px-4 py-2 text-[11px] font-medium ${
                  marketChip === "stocks"
                    ? "bg-white text-[#0d1a24]"
                    : "bg-white/8 text-white/70"
                }`}
              >
                Stocks
              </button>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              {liveCards.map((card) => (
                <div
                  key={card.label}
                  className={`rounded-2xl border border-white/8 bg-gradient-to-br ${card.color} p-3`}
                >
                  <p className="text-[9px] uppercase tracking-[0.22em] text-cyan-200/80">
                    Live
                  </p>
                  <p className="mt-3 text-sm font-semibold">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="mb-2 flex items-center gap-3 px-1 text-[10px] font-medium text-white/55">
              <span>Favorites</span>
              <span className="text-white">Hot Picks</span>
              <span>All</span>
              <span>New</span>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="rounded-[18px] border border-white/8 bg-[#091720] p-5 text-center">
                  <p className="text-sm text-white/55">Loading market prices...</p>
                </div>
              ) : (
                coins.map((coin) => (
                  <div
                    key={coin.symbol}
                    className="rounded-[18px] border border-white/8 bg-[#091720] p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[15px] font-bold">{coin.name}</p>
                        <p className="mt-1 text-[10px] text-white/45">
                          {coin.symbol}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[14px] font-semibold">
                          ${coin.price.toLocaleString()}
                        </p>
                        <p
                          className={`mt-1 text-[10px] ${
                            coin.change >= 0 ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {coin.change.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 rounded-[24px] border border-white/8 bg-[#0a1821] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-white/90">Swap Route</p>
                <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold text-amber-200">
                  Coming Soon
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#06131b] p-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                  Next Upgrade
                </p>
                <p className="mt-2 text-sm text-white/80">
                  Swap Route
Active

Real-time swap routing is now enabled.
Transactions are executed via integrated liquidity providers.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 rounded-full border border-white/8 bg-white/6 p-1.5 text-center">
              <Link
                href="/dashboard"
                className="rounded-full px-2 py-2 text-[10px] font-medium text-white/70"
              >
                Home
              </Link>
              <Link
                href="/dashboard/market"
                className="rounded-full bg-cyan-500/90 px-2 py-2 text-[10px] font-medium text-[#031019]"
              >
                Markets
              </Link>
              <span className="rounded-full px-2 py-2 text-[10px] font-medium text-white/70">
                Swap
              </span>
              <Link
                href="/dashboard/history"
                className="rounded-full px-2 py-2 text-[10px] font-medium text-white/70"
              >
                Wallet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}