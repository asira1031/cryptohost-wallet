"use client";

import { useState } from "react";
import { ethers } from "ethers";

export default function MetaMaskPage() {
  const [wallet, setWallet] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setWallet(accounts[0]);
  }

  async function sendNow() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });

      alert("Sent! TX: " + tx.hash);
    } catch (err) {
      alert("Failed");
      console.log(err);
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>MetaMask Signer</h1>

      <button onClick={connectWallet}>Connect Wallet</button>

      <p>{wallet}</p>

      <input
        placeholder="Recipient"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <br /><br />

      <button onClick={sendNow}>Send</button>
    </div>
  );
}