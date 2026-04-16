"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type TxStatus = "pending" | "confirmed" | "failed";

type WalletTx = {
  id: string;
  walletAddress: string;
  txHash: string;
  token: string;
  amount: string;
  to: string;
  status: TxStatus;
  createdAt: string;
};

const STORAGE_KEY = "cryptohost_wallet_tx_history";

function shorten(value: string, start = 6, end = 4) {
  if (!value) return "-";
  if (value.length <= start + end) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

function readTransactions(): WalletTx[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export default function WalletHistoryPage() {
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TxStatus>("all");

  useEffect(() => {
    setTransactions(readTransactions());
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .filter((tx) => {
        const matchesSearch =
          !q ||
          tx.walletAddress.toLowerCase().includes(q) ||
          tx.txHash.toLowerCase().includes(q) ||
          tx.to.toLowerCase().includes(q) ||
          tx.token.toLowerCase().includes(q) ||
          tx.amount.toLowerCase().includes(q);

        const matchesStatus =
          statusFilter === "all" ? true : tx.status === statusFilter;

        return matchesSearch && matchesStatus;
      });
  }, [transactions, search, statusFilter]);

  const totals = useMemo(() => {
    const confirmed = transactions.filter((tx) => tx.status === "confirmed").length;
    const pending = transactions.filter((tx) => tx.status === "pending").length;
    const failed = transactions.filter((tx) => tx.status === "failed").length;

    return {
      total: transactions.length,
      confirmed,
      pending,
      failed,
    };
  }, [transactions]);

  const clearAll = () => {
    if (!window.confirm("Clear all wallet transaction history?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setTransactions([]);
  };

  return (
    <div className="rounded-[22px] border border-white/10 bg-[#071923]/95 p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-300 via-pink-400 to-rose-500" />
        <div className="flex-1 rounded-full bg-white/5 px-4 py-2 text-[11px] text-white/35">
          Search history
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="rounded-full border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-[10px] font-semibold text-rose-200"
        >
          Clear
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/75">
            CryptoHost Wallet
          </p>
          <h1 className="mt-1 text-2xl font-bold">History</h1>
        </div>

        <div className="rounded-full border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-1.5 text-[10px] font-semibold text-fuchsia-200">
          {totals.total} records
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-white/8 bg-[#091720] p-3">
          <p className="text-[9px] uppercase tracking-[0.22em] text-white/45">
            Total
          </p>
          <p className="mt-2 text-2xl font-bold">{totals.total}</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#091720] p-3">
          <p className="text-[9px] uppercase tracking-[0.22em] text-white/45">
            Confirmed
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-300">
            {totals.confirmed}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#091720] p-3">
          <p className="text-[9px] uppercase tracking-[0.22em] text-white/45">
            Pending
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-300">
            {totals.pending}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#091720] p-3">
          <p className="text-[9px] uppercase tracking-[0.22em] text-white/45">
            Failed
          </p>
          <p className="mt-2 text-2xl font-bold text-rose-300">
            {totals.failed}
          </p>
        </div>
      </div>

      <div className="mb-3 space-y-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search wallet, tx hash, token..."
          className="w-full rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | TxStatus)}
          className="w-full rounded-2xl border border-white/10 bg-[#06131b] px-4 py-3 text-sm text-white outline-none"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-[18px] border border-white/8 bg-[#091720] p-5 text-center">
            <p className="text-sm text-white/55">No transaction history yet.</p>
            <p className="mt-1 text-[11px] text-white/35">
              Send a wallet transaction and it will appear here.
            </p>
          </div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="rounded-[18px] border border-white/8 bg-[#091720] p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-bold">{tx.token}</p>
                  <p className="mt-1 text-[10px] text-white/45">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                    tx.status === "confirmed"
                      ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                      : tx.status === "pending"
                      ? "border border-amber-400/30 bg-amber-500/10 text-amber-200"
                      : "border border-rose-400/30 bg-rose-500/10 text-rose-200"
                  }`}
                >
                  {tx.status}
                </span>
              </div>

              <div className="grid gap-2 text-[11px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/45">Amount</span>
                  <span className="font-medium text-white/90">{tx.amount}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/45">From</span>
                  <span className="font-medium text-white/90">
                    {shorten(tx.walletAddress)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/45">To</span>
                  <span className="font-medium text-white/90">{shorten(tx.to)}</span>
                </div>

                <div className="rounded-xl border border-white/8 bg-[#06131b] p-2">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-white/35">
                    Tx Hash
                  </p>
                  <p className="mt-1 break-all font-mono text-[11px] text-cyan-200">
                    {tx.txHash}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
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
          className="rounded-full px-2 py-2 text-[10px] font-medium text-white/70"
        >
          Markets
        </Link>
        <Link
          href="/dashboard/history"
          className="rounded-full bg-fuchsia-500/90 px-2 py-2 text-[10px] font-medium text-[#031019]"
        >
          Wallet
        </Link>
        <span className="rounded-full px-2 py-2 text-[10px] font-medium text-white/50">
          Secure
        </span>
      </div>
    </div>
  );
}