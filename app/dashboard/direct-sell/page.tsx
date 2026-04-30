"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase/client";

export default function DirectSellPage() {
  const [coin, setCoin] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [proof, setProof] = useState("");

  const submitOrder = async () => {
    if (!amount) {
      alert("Enter amount");
      return;
    }

    if (!payoutMethod) {
      alert("Choose payout method");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          order_type: "SELL",
          coin,
          amount,
          status: "Waiting Crypto",
          proof: payoutMethod,
        },
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert(error.message);
      console.log(error);
      return;
    }

    setOrderId(data.id);
    setStep(3);
  };

  const submitHash = async () => {
    if (!proof) {
      alert("Enter TX Hash");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({
        proof: payoutMethod + " | " + proof,
        status: "TX Submitted",
      })
      .eq("id", orderId);

    if (error) {
      alert(error.message);
      console.log(error);
      return;
    }

    alert("TX Hash submitted!");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Direct Sell
      </h1>

      {step === 1 && (
        <>
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
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 mb-4 bg-zinc-900 rounded"
          />

          <button
            onClick={() => setStep(2)}
            className="w-full bg-blue-600 p-3 rounded font-bold"
          >
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl font-bold mb-4">
            Choose Payout Method
          </h2>

          <div className="space-y-3">
            {["GCash", "PayMaya", "BPI", "MareBank", "PayPal"].map(
              (method) => (
                <button
                  key={method}
                  onClick={() => setPayoutMethod(method)}
                  className={`w-full text-left p-3 rounded ${
                    payoutMethod === method
                      ? "bg-blue-600"
                      : "bg-zinc-900"
                  }`}
                >
                  {method}
                </button>
              )
            )}
          </div>

          <button
            onClick={submitOrder}
            disabled={loading}
            className="w-full mt-4 bg-blue-600 p-3 rounded font-bold"
          >
            {loading ? "Submitting..." : "Create Sell Order"}
          </button>
        </>
      )}

      {step === 3 && (
        <div className="bg-zinc-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-4">
            Send Crypto Now
          </h2>

          <p>Order ID: {orderId}</p>
          <p>Payout Method: {payoutMethod}</p>
          <p>Status: Waiting Crypto</p>

          <p className="mt-4 text-sm text-zinc-400">
            Send your selected crypto to the wallet below.
            Once confirmed, payout will be sent to{" "}
            {payoutMethod}.
          </p>

          <p className="mt-3 text-yellow-400 text-sm">
            Supported Networks: BEP20 / ERC20
          </p>

          <p className="mt-4 text-green-400 break-all font-bold">
            0xc47133a6bd653793562a1ea25cb1d3161fbd99cd
          </p>

          <input
            type="text"
            placeholder="Enter TX Hash"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            className="w-full p-3 mt-4 bg-black rounded"
          />

          <button
            onClick={submitHash}
            className="w-full mt-3 bg-green-600 p-3 rounded font-bold"
          >
            Submit TX Hash
          </button>
        </div>
      )}
    </div>
  );
}