"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

const USDT_CONTRACT =
  "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export default function UsdtReceiveCard() {
  const [walletAddress, setWalletAddress] =
    useState("");

  const [usdtBalance, setUsdtBalance] =
    useState("0.00");

  const [loading, setLoading] =
    useState(false);

  const [status, setStatus] =
    useState("");

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    const address =
      localStorage.getItem(
        "imported_wallet_address"
      ) ||
      localStorage.getItem(
        "cryptohost_main_wallet"
      ) ||
      "";

    if (!address) {
      setStatus("No wallet found.");
      return;
    }

    setWalletAddress(address);
    await fetchUsdt(address);
  }

  async function fetchUsdt(
    address: string
  ) {
    try {
      setLoading(true);
      setStatus("");

      const rpc =
        process.env
          .NEXT_PUBLIC_ETH_RPC_URL ||
        "https://ethereum-rpc.publicnode.com";

      const provider =
        new ethers.JsonRpcProvider(
          rpc
        );

      const token =
        new ethers.Contract(
          USDT_CONTRACT,
          ABI,
          provider
        );

      const raw =
        await token.balanceOf(
          address
        );

      const decimals =
        await token.decimals();

      const formatted =
        ethers.formatUnits(
          raw,
          decimals
        );

      setUsdtBalance(
        Number(
          formatted
        ).toFixed(2)
      );

      setStatus(
        "USDT balance refreshed."
      );
    } catch {
      setStatus(
        "Failed to load USDT."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyAddress() {
    if (!walletAddress) return;

    await navigator.clipboard.writeText(
      walletAddress
    );

    setStatus(
      "Wallet address copied."
    );
  }

  return (
    <div className="rounded-3xl bg-zinc-950 border border-white/10 p-5 mt-5">
      <p className="text-sm text-zinc-400 mb-2">
        USDT Receive
      </p>

      <p className="text-2xl font-bold text-emerald-400 mb-3">
        {usdtBalance} USDT
      </p>

      <p className="text-xs text-zinc-400 mb-2">
        ERC20 Wallet Address
      </p>

      <p className="text-xs break-all mb-4">
        {walletAddress ||
          "No wallet"}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={copyAddress}
          className="rounded-2xl bg-zinc-800 py-3 text-sm"
        >
          Copy Address
        </button>

        <button
          onClick={() =>
            fetchUsdt(
              walletAddress
            )
          }
          disabled={
            loading ||
            !walletAddress
          }
          className="rounded-2xl bg-emerald-500 py-3 text-sm text-black font-bold disabled:opacity-50"
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {status && (
        <p className="text-xs text-zinc-400 mt-4">
          {status}
        </p>
      )}
    </div>
  );
}