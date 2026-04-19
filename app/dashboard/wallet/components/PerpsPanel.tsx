"use client";

export default function PerpsPanel() {
  const markets = [
    {
      symbol: "BTC-PERP",
      price: "$77,200",
      change: "+2.1%",
      leverage: "10x",
      status: "Active",
    },
    {
      symbol: "ETH-PERP",
      price: "$2,410",
      change: "+1.4%",
      leverage: "15x",
      status: "Active",
    },
    {
      symbol: "SOL-PERP",
      price: "$88.50",
      change: "+0.9%",
      leverage: "20x",
      status: "Preparing",
    },
  ];

  return (
    <div className="mt-4 space-y-4 rounded-[26px] border border-cyan-400/15 bg-[#081923] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-cyan-400/15 bg-cyan-500/10 p-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-300/70">
            Perpetuals Market
          </p>
          <h3 className="mt-1 text-base font-semibold text-white">
            Live derivatives trading panel
          </h3>
          <p className="mt-1 text-xs text-white/60">
            Execution routing, liquidity preparation, and market monitoring.
          </p>
        </div>

        <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
          Live
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {markets.map((market) => (
          <div
            key={market.symbol}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                  {market.symbol}
                </p>
                <p className="mt-2 text-lg font-bold text-white">
                  {market.price}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  market.status === "Active"
                    ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                    : "border border-amber-400/20 bg-amber-500/10 text-amber-300"
                }`}
              >
                {market.status}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-white/50">24h Change</span>
              <span className="font-semibold text-emerald-400">
                {market.change}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-white/50">Max Leverage</span>
              <span className="font-semibold text-cyan-200">
                {market.leverage}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">
              Market Preparation Status
            </p>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
              Preparing
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-white/55">Liquidity routing</span>
                <span className="text-cyan-200">82%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 w-[82%] rounded-full bg-cyan-400" />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-white/55">Execution engine</span>
                <span className="text-cyan-200">76%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 w-[76%] rounded-full bg-cyan-400" />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-white/55">Risk sync</span>
                <span className="text-cyan-200">91%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 w-[91%] rounded-full bg-cyan-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">System Notice</p>
          <div className="mt-3 rounded-2xl border border-white/10 bg-[#06131b] p-3 text-sm text-white/70">
            Perpetual trading is currently being prepared. Liquidity providers,
            execution routing, and market synchronization are initializing for
            the next trading phase.
          </div>

          <div className="mt-3 rounded-2xl border border-amber-400/15 bg-amber-500/10 p-3 text-xs text-amber-200">
            Trading controls and order execution are not yet enabled in this
            preview panel.
          </div>
        </div>
      </div>
    </div>
  );
}