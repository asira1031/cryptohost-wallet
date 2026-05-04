"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();

  // 🔥 SAVE USER (fixed + safe)
 useEffect(() => {
  async function saveUser() {
    try {
      const alreadySaved = localStorage.getItem("user_saved");
      if (alreadySaved === "true") return;

      let wallet = localStorage.getItem("evm_address");

      if (!wallet) {
        wallet = localStorage.getItem("user_id");

        if (!wallet) {
          wallet =
            "USER-" + Math.random().toString(36).slice(2, 8);
          localStorage.setItem("user_id", wallet);
        }
      }

      const referrer =
        localStorage.getItem("referrer") || null;

      console.log("INSERTING:", wallet, referrer);

      await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       body: JSON.stringify({
  wallet,
  referrer,
  user_id: wallet, // same for now
})
      });

      localStorage.setItem("user_saved", "true");
    } catch (err) {
      console.error("Save user failed", err);
    }
  }

  saveUser();
}, []);
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