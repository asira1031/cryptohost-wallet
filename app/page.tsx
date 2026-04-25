"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedPin = localStorage.getItem("ch_pin");
    if (!savedPin) {
      // first time setup
      localStorage.setItem("ch_pin", "1234"); // default PIN
    }
  }, []);

  const handleLogin = () => {
    const savedPin = localStorage.getItem("ch_pin");

    if (pin === savedPin) {
      router.push("/dashboard/wallet");
    } else {
      setError("Incorrect PIN");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <div className="w-[300px] space-y-4">
        <h1 className="text-xl font-bold text-center">CryptoHost Login</h1>

        <input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full rounded bg-white/10 p-2 text-white"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-cyan-500 py-2 rounded"
        >
          Login
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
}