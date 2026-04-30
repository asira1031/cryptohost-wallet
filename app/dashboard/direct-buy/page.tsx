"use client";

import { useState } from "react";

export default function DirectBuyPage() {
  const [coin, setCoin] = useState("USDT");
  const [amount, setAmount] = useState("");

  const submitOrder = () => {
    const orders =
      JSON.parse(localStorage.getItem("cryptohost_orders") || "[]");

    const newOrder = {
      id: "CH" + Date.now(),
      type: "BUY",
      coin,
      amount,
      status: "Pending",
      date: new Date().toLocaleString(),
    };

    localStorage.setItem(
      "cryptohost_orders",
      JSON.stringify([newOrder, ...orders])
    );

    alert("Buy order submitted!");
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Direct Buy</h1>

      <select
        value={coin}
        onChange={(e) => setCoin(e.target.value)}
        className="w-full p-3 mb-4 bg-zinc-900 rounded"
      >
        <option>USDT</option>
        <option>BTC</option>
        <option>ETH</option>
      </select>

      <input
        type="number"
        placeholder="Enter Amount PHP"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 mb-4 bg-zinc-900 rounded"
      />

      <button
        onClick={submitOrder}
        className="w-full bg-green-600 p-3 rounded font-bold"
      >
        Submit Buy Order
      </button>
    </div>
  );
}