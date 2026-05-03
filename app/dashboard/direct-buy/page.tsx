"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";

export default function DirectBuyPage() {
  const [coin, setCoin] = useState("USDT");
  const [amount, setAmount] = useState(""); // USER INPUT = USDT
  const [paymentMethod, setPaymentMethod] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [usdtPhp, setUsdtPhp] = useState(61.29);
  const [lastUpdated, setLastUpdated] = useState("");

  // LIVE RATE
  useEffect(() => {
    const loadRates = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=php",
          { cache: "no-store" }
        );

        const data = await res.json();

        if (data?.tether?.php) {
          setUsdtPhp(Number(data.tether.php));
        }

        setLastUpdated(
          new Date().toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      } catch (error) {
        console.log(error);
      }
    };

    loadRates();
    const timer = setInterval(loadRates, 10000);

    return () => clearInterval(timer);
  }, []);

  const quote = useMemo(() => {
    const buyAmount = Number(amount) || 0; // requested USDT

    const feeUsdt = buyAmount * 0.015; // 1.5%
    const receive = buyAmount - feeUsdt;

    // YOUR SELL RATE
    const adjustedRate = Math.max(usdtPhp - 1.2, 1);

    // total php customer pays based on original amount
    const totalPhp = buyAmount * adjustedRate;

    return {
      buyAmount,
      feeUsdt,
      receive,
      adjustedRate,
      totalPhp,
    };
  }, [amount, usdtPhp]);

  const submitOrder = async () => {
    if (!amount) return alert("Enter USDT amount");
    if (!paymentMethod) return alert("Choose payment method");

    setLoading(true);

    const { error } = await supabase.from("orders").insert([
      {
        order_type: "BUY",
        coin,
        amount: quote.buyAmount,
        status: "Waiting Payment",
        proof: paymentMethod,
        receive_amount: quote.receive,
        service_fee: quote.feeUsdt,
        total_php: quote.totalPhp,
      },
    ]);

    setLoading(false);

    if (error) return alert(error.message);

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
          </select>

          <input
            type="number"
            placeholder="Enter USDT Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 mb-4 bg-zinc-900 rounded"
          />

          {Number(amount) > 0 && (
            <>
              {/* INFO CARD */}
              <div className="bg-zinc-900 rounded p-4 mb-4 space-y-3">
                <div className="flex justify-between">
                  <span>You Buy</span>
                  <span>{quote.buyAmount.toFixed(2)} USDT</span>
                </div>

                <div className="flex justify-between">
                  <span>Service Fee (1.5%)</span>
                  <span>{quote.feeUsdt.toFixed(6)} USDT</span>
                </div>

                <div className="flex justify-between">
                  <span>Rate</span>
                  <span>₱{quote.adjustedRate.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-bold">
                  <span>Total To Pay</span>
                  <span>₱{quote.totalPhp.toFixed(2)}</span>
                </div>

                <div className="text-xs text-zinc-500 text-center">
                  Updated: {lastUpdated}
                </div>
              </div>

              {/* BUYER CARD */}
              <div className="bg-green-600/10 border border-green-500 rounded p-4 mb-4 text-center">
                <div className="text-sm text-green-300 mb-1">
                  Buyer Receives
                </div>

                <div className="text-4xl font-bold text-green-400">
                  {quote.receive.toFixed(6)}
                </div>

                <div className="text-xl font-semibold text-green-300">
                  USDT
                </div>

                <div className="text-xs text-green-200 mt-2">
                  Net amount after service fee
                </div>
              </div>
            </>
          )}

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

    <p className="mt-2">
      Total To Pay: ₱{quote.totalPhp.toFixed(2)}
    </p>

    <p>
      Buyer Receives: {quote.receive.toFixed(6)} USDT
    </p>

    {paymentMethod === "PayPal" && (
      <a
        href="https://www.paypal.com/ncp/payment/LBWJJ3CQYS4MU"
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-4 bg-blue-600 text-center p-3 rounded font-bold"
      >
        Pay Now with PayPal
      </a>
    )}

    {paymentMethod === "GCash" && (
      <div className="mt-4 text-green-400">
        GCash: 09288985979
      </div>
    )}

    {paymentMethod === "PayMaya" && (
      <div className="mt-4 text-green-400">
        PayMaya: 09498387452
      </div>
    )}

    {paymentMethod === "BPI" && (
      <div className="mt-4 text-green-400">
        BPI: 0629075905
      </div>
    )}

    {paymentMethod === "MareBank" && (
      <div className="mt-4 text-green-400">
        MareBank: 1012432229
      </div>
    )}

    <p className="mt-4 text-yellow-400 text-sm">
      Use your Order ID as payment reference.
    </p>
  </div>
)}
    </div>
  );
}