"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase/client";

export default function DirectBuyPage() {
  const [coin, setCoin] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const submitOrder = async () => {
    if (!amount) {
      alert("Enter amount");
      return;
    }

    if (!paymentMethod) {
      alert("Choose payment method");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("orders").insert([
      {
        order_type: "BUY",
        coin,
        amount,
        status: "Waiting Payment",
        proof: paymentMethod,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
      console.log(error);
      return;
    }

    setStep(3);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Direct Buy
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
            placeholder="Enter Amount PHP"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 mb-4 bg-zinc-900 rounded"
          />

          <button
            onClick={() => setStep(2)}
            className="w-full bg-green-600 p-3 rounded font-bold"
          >
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl font-bold mb-4">
            Choose Payment Method
          </h2>

          <div className="space-y-3">
            {["GCash", "PayMaya", "BPI", "MareBank", "PayPal"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setPaymentMethod(item)}
                  className={`w-full text-left p-3 rounded ${
                    paymentMethod === item
                      ? "bg-green-600"
                      : "bg-zinc-900"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>

          <button
            onClick={submitOrder}
            disabled={loading}
            className="w-full mt-4 bg-green-600 p-3 rounded font-bold"
          >
            {loading ? "Submitting..." : "Create Order"}
          </button>
        </>
      )}

      {step === 3 && (
        <div className="bg-zinc-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-4">
            Order Submitted
          </h2>

          <p>Selected Method: {paymentMethod}</p>

          {paymentMethod === "GCash" && (
            <p className="mt-4">
              GCash: 09288985979
            </p>
          )}

          {paymentMethod === "PayMaya" && (
            <p className="mt-4">
              PayMaya: 09498387452
            </p>
          )}

          {paymentMethod === "BPI" && (
            <p className="mt-4">
              BPI: 0629075905
            </p>
          )}

          {paymentMethod === "MareBank" && (
            <p className="mt-4">
              MareBank: 1012432229
            </p>
          )}

          {paymentMethod === "PayPal" && (
            <a
              href="https://www.paypal.com/ncp/payment/LBWJJ3CQYS4MU"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 bg-blue-600 text-center p-3 rounded font-bold"
            >
              Pay with PayPal
            </a>
          )}

          <p className="mt-4 text-yellow-400">
            Use your Order ID as payment reference.
          </p>
        </div>
      )}
    </div>
  );
}