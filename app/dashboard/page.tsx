"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#101010] p-6">
        <h1 className="text-3xl font-bold text-[#f7a600] mb-2">
          Dashboard
        </h1>

        <p className="text-white/60 mb-6 text-sm">
          Welcome to CryptoHost Wallet
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/dashboard/wallet")}
            className="rounded-2xl bg-[#f7a600] py-3 font-semibold text-black"
          >
            Wallet
          </button>

          <button
            onClick={() => router.push("/dashboard/market")}
            className="rounded-2xl bg-[#1a1a1a] py-3 font-semibold"
          >
            Market
          </button>

          <button
            onClick={() => router.push("/dashboard/swap")}
            className="rounded-2xl bg-[#1a1a1a] py-3 font-semibold"
          >
            Swap
          </button>

          <button
            onClick={() => router.push("/dashboard/security")}
            className="rounded-2xl bg-[#1a1a1a] py-3 font-semibold"
          >
            Security
          </button>
        </div>
      </section>
    </main>
  );
}