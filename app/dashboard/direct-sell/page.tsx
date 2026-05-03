"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";

export default function DirectSellPage() {
  const [coin, setCoin] = useState("USDT");
  const [amount, setAmount] = useState(""); // crypto amount user sells
  const [payoutMethod, setPayoutMethod] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [proof, setProof] = useState("");
  const [currency, setCurrency] = useState("PHP");
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

  // SELL QUOTE

const quote = useMemo(() => {
  const sellAmount = Number(amount) || 0;

  const payoutRate = usdtPhp + 1.3;

  const grossPhp = sellAmount * payoutRate;

  const feePhp = grossPhp * 0.015;
  const netPhp = grossPhp - feePhp;

  const fxRates: Record<string, number> = {
    PHP: 1,
    USD: 56,
    EUR: 61,
    GBP: 72,
    INR: 0.72,
    AED: 15.30,
    TRY: 1.45,
    MYR: 13.20,
  };

  const convertedNet =
    netPhp / fxRates[currency];

  return {
    sellAmount,
    payoutRate,
    grossPhp,
    feePhp,
    netPhp,
    convertedNet,
    currency,
  };
}, [amount, usdtPhp, currency]);

  const submitOrder = async () => {
    if (!amount) return alert("Enter amount");
    if (!payoutMethod) return alert("Choose payout method");

    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .insert([
 {
   order_type: "SELL",
   coin,
   amount: quote.sellAmount,
   status: "Waiting Crypto",
   proof: payoutMethod
 }
])
      .select()
      .single();

    setLoading(false);

    if (error) return alert(error.message);

    setOrderId(data.id);
    setStep(3);
  };

  const submitHash = async () => {
    if (!proof) return alert("Enter TX Hash");

    const { error } = await supabase
      .from("orders")
      .update({
        proof: payoutMethod + " | " + proof,
        status: "TX Submitted",
      })
      .eq("id", orderId);

    if (error) return alert(error.message);

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
  value={currency}
  onChange={(e) => setCurrency(e.target.value)}
  className="w-full p-3 mb-4 bg-zinc-900 rounded"
>
  <option value="PHP">PHP ₱</option>
  <option value="USD">USD $</option>
  <option value="EUR">EUR €</option>
  <option value="GBP">GBP £</option>
  <option value="INR">INR ₹</option>
  <option value="AED">AED د.إ</option>
  <option value="TRY">TRY ₺</option>
  <option value="MYR">MYR RM</option>

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
              <div className="bg-zinc-900 rounded p-4 mb-4 space-y-3">
                <div className="flex justify-between">
                  <span>You Sell</span>
                  <span>{quote.sellAmount.toFixed(2)} USDT</span>
                </div>

                <div className="flex justify-between">
                  <span>Today's Rate</span>
                  <span>₱{quote.payoutRate.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>₱{quote.feePhp.toFixed(2)}</span>
                </div>

                <div className="text-xs text-zinc-500 text-center">
                  Updated: {lastUpdated}
                </div>
              </div>

              <div className="bg-blue-600/10 border border-blue-500 rounded p-4 mb-4 text-center">
                <div className="text-sm text-blue-300 mb-1">
                  You Will Receive
                </div>

                <div className="text-4xl font-bold text-blue-400">
                 {quote.currency} {quote.convertedNet.toFixed(2)}
                </div>

                <div className="text-xs text-blue-200 mt-2">
                  Net payout after fee
                </div>
              </div>
            </>
          )}

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

          <p className="mt-2">
           Payout Amount: {quote.currency} {quote.convertedNet.toFixed(2)}
          </p>

          <p className="mt-4 text-sm text-zinc-400">
            Send your crypto to the wallet below.
            After confirmation, payout will be sent.
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