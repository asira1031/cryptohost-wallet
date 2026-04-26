"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { loadEvmWallet } from "../../lib/wallet/evmWallet";
import { getProvider } from "../../lib/wallet-provider";

export default function WalletPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const wallet = loadEvmWallet();

    if (!wallet?.privateKey) {
      setMessage("No wallet loaded. Please import wallet in Security.");
      return;
    }

    const provider = getProvider("ETH");
    const signer = new ethers.Wallet(wallet.privateKey, provider);

    setWalletAddress(signer.address);

    provider.getBalance(signer.address).then((bal) => {
      setBalance(ethers.formatEther(bal));
    });
  }, []);

  async function handleSend() {
    try {
      setMessage("");

      const wallet = loadEvmWallet();

      if (!wallet?.privateKey) {
        setMessage("No wallet loaded.");
        return;
      }

      const provider = getProvider("ETH");
      const signer = new ethers.Wallet(wallet.privateKey, provider);

      // 🔥 CRITICAL CHECK
      if (signer.address.toLowerCase() !== walletAddress.toLowerCase()) {
        setMessage("Wallet mismatch detected. Re-import wallet.");
        return;
      }

      if (!recipient || !sendAmount) {
        setMessage("Enter recipient and amount.");
        return;
      }

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(sendAmount),
      });

      setMessage("Transaction sent: " + tx.hash);
    } catch (err: any) {
      setMessage(err.message || "Transaction failed.");
    }
  }

  return (
    <div className="min-h-screen bg-[#06121f] p-6 text-white">
      <div className="max-w-md mx-auto bg-[#071b2b] p-6 rounded-2xl">

        <h1 className="text-xl mb-4">Wallet</h1>

        <p className="text-sm break-all mb-2">
          Address: {walletAddress || "No wallet"}
        </p>

        <p className="mb-4">
          Balance: {balance} ETH
        </p>

        <input
          placeholder="Recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-2 mb-2 text-black"
        />

        <input
          placeholder="Amount ETH"
          value={sendAmount}
          onChange={(e) => setSendAmount(e.target.value)}
          className="w-full p-2 mb-2 text-black"
        />

        <button
          onClick={handleSend}
          className="w-full bg-blue-500 p-2 mt-2"
        >
          Send ETH
        </button>

        {message && (
          <p className="mt-4 text-yellow-300 text-sm">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}