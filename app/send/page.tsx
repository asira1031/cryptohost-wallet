"use client";

import { useState } from "react";
import { ethers } from "ethers";

// ✅ Fix TypeScript error for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function SendETH() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const sendETH = async () => {
    try {
      // ✅ Ensure running in browser
      if (typeof window === "undefined") {
        return;
      }

      // ✅ Check MetaMask
      if (!window.ethereum) {
        alert("MetaMask not installed");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setStatus("Sending transaction...");

      const tx = await signer.sendTransaction({
        to: to,
        value: ethers.parseEther(amount),
      });

      await tx.wait();

      setStatus("✅ Sent! TX: " + tx.hash);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Error: " + (err?.message || "Transaction failed"));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Send ETH</h2>

      <input
        placeholder="Recipient Address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        style={{ display: "block", marginBottom: 10, width: "300px" }}
      />

      <input
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ display: "block", marginBottom: 10, width: "300px" }}
      />

      <button onClick={sendETH}>Send ETH</button>

      <p>{status}</p>
    </div>
  );
}