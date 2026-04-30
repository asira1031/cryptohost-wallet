"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { supabase } from "@/app/lib/supabase/client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { loadEvmWallet } from "../../lib/wallet/evmWallet";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
const { connect, connectors } = useConnect();
const { disconnect } = useDisconnect();
  const [walletAddress, setWalletAddress] =
    useState("");

  const [ethBalance, setEthBalance] =
    useState("0.000000");

  const [bnbBalance, setBnbBalance] =
    useState("0.000000");

  const [usdtBalance, setUsdtBalance] =
    useState("0.00");
  const [points, setPoints] =
  useState("0.00");

  const [asset, setAsset] =
    useState("ETH");

  const [to, setTo] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [status, setStatus] =
    useState("");

  const [showReceive, setShowReceive] =
    useState(false);

  const [showBuyModal, setShowBuyModal] =
    useState(false);

  const [showSellModal, setShowSellModal] =
    useState(false);

    const feePreview =
  amount && !isNaN(Number(amount))
    ? (Number(amount) * 0.015).toFixed(6)
    : "0.000000";

const totalPreview =
  amount && !isNaN(Number(amount))
    ? (Number(amount) + Number(feePreview)).toFixed(6)
    : "0.000000";
    const currentWallet =
  walletAddress ||
  (typeof window !== "undefined"
    ? localStorage.getItem("imported_wallet_address") ||
      localStorage.getItem("cryptohost_main_wallet") ||
      ""
    : "");

  const SEND_FEE =
    process.env
      .NEXT_PUBLIC_SEND_FEE ||
    "1.5";

  const BUY_FEE =
    process.env
      .NEXT_PUBLIC_BUY_FEE ||
    "1.5";

  const SELL_FEE =
    process.env
      .NEXT_PUBLIC_SELL_FEE ||
    "1.5";

 useEffect(() => {
  loadWallet();
}, []);

async function loadWallet() {
  try {
    // FIRST: load signer wallet from backend
   const targetWallet =
  localStorage.getItem("imported_wallet_address") ||
  localStorage.getItem("cryptohost_main_wallet") ||
  "";

const res = await fetch(
  `/api/debug-wallet?address=${targetWallet}`
);
    const data = await res.json();

    if (data.success) {
  const realAddress =
    data.address ||
    data.walletAddress ||
    data.wallet ||
    "";

  setWalletAddress(realAddress);
  setEthBalance(Number(data.balance || 0).toFixed(6));
}

    // LOCAL STORAGE
    const imported =
      localStorage.getItem(
        "imported_wallet_address"
      ) || "";

    const mainWallet =
      localStorage.getItem(
        "cryptohost_main_wallet"
      ) || "";

    const privateKey =
      localStorage.getItem(
        "privateKey"
      ) || "";

    // CREATE WALLET IF NONE EXISTS
    if (
      (!mainWallet && !imported) ||
      ((mainWallet || imported) &&
        !privateKey)
    ) {
      const newWallet =
        ethers.Wallet.createRandom();

      localStorage.setItem(
        "cryptohost_main_wallet",
        newWallet.address
      );

      localStorage.setItem(
        "imported_wallet_address",
        newWallet.address
      );

      localStorage.setItem(
        "privateKey",
        newWallet.privateKey
      );

      localStorage.setItem(
        "active_wallet",
        "main"
      );
const savedWallet =
  localStorage.getItem("imported_wallet_address") ||
  localStorage.getItem("cryptohost_main_wallet") ||
  localStorage.getItem("main_wallet_address") ||
  "";

console.log("Saved wallet:", savedWallet);

if (!savedWallet) {
  setWalletAddress("");
  setEthBalance("0.000000");
  setBnbBalance("0.000000");
  setUsdtBalance("0.00");
  return;
}

setWalletAddress(savedWallet);

setWalletAddress(savedWallet);
    }

    // ACTIVE WALLET
    const active =
      localStorage.getItem(
        "active_wallet"
      ) || "main";
const address =
  active === "imported" &&
  imported
    ? imported
    : mainWallet;
if (!data.success) {
  if (!data.success) {
  // keep current wallet from localStorage
}
}
    // BNB BALANCE
    try {
      const bscProvider =
        new ethers.JsonRpcProvider(
          process.env
            .NEXT_PUBLIC_BSC_RPC_URL ||
            "https://bsc-dataseed.binance.org"
        );

      const bnbWei =
        await bscProvider.getBalance(
          address
        );

      setBnbBalance(
        Number(
          ethers.formatEther(
            bnbWei
          )
        ).toFixed(6)
      );
    } catch {}

    // INTERNAL BALANCES FROM SUPABASE
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: balanceRow } =
        await supabase
          .from("balances")
          .select(
            "eth_balance, usdt_balance, points"
          )
          .eq("user_id", user.id)
          .single();

      if (balanceRow) {
        setEthBalance(
          Number(
            balanceRow.eth_balance
          ).toFixed(6)
        );

        setUsdtBalance(
          Number(
            balanceRow.usdt_balance
          ).toFixed(2)
        );

        setPoints(
          Number(
            balanceRow.points
          ).toFixed(2)
        );
      }
    } else {
      setUsdtBalance("0.00");
    }
  } catch {
    setEthBalance("0.000000");
    setBnbBalance("0.000000");
    setUsdtBalance("0.00");
  }
}
function openTransak() {
  try {
    window.open(
      "https://transak.com",
      "_blank"
    );
  } catch {}
}

async function handleSend() {
  try {
    setStatus("");
    setSending(true);

    if (!to || !amount) {
      setStatus(
        "Enter recipient and amount."
      );
      setSending(false);
      return;
    }

    if (
      !ethers.isAddress(to)
    ) {
      setStatus(
        "Invalid recipient address."
      );
      setSending(false);
      return;
    }

    if (
      Number(amount) <= 0
    ) {
      setStatus(
        "Enter valid amount."
      );
      setSending(false);
      return;
    }

    const savedWallet =
loadEvmWallet();

const privateKey =
  savedWallet?.privateKey || "";

if (!privateKey) {
  setStatus(
    "Connect MetaMask, Trust Wallet, or WalletConnect to send funds securely."
  );
  setSending(false);
  return;
}
    const res =
      await fetch(
        "/api/send",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            {
              asset,
              to,
              amount,
              privateKey,
            }
          ),
        }
      );

    const data =
      await res.json();

    if (!res.ok) {
      setStatus(
        data.error ||
          "Send failed."
      );
      setSending(false);
      return;
    }

    setStatus(
  `Sent Successfully
Main Tx: ${data.hash}
Fee Tx: ${data.feeHash}`
);

const {
  data: { user },
} = await supabase.auth.getUser();

if (user) {
  await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type: "send",
      asset,
      amount: -Number(amount),
      status: "completed",
      reference: data.hash,
      note: to,
    });
}

setTo("");
setAmount("");
await loadWallet();

setSending(false);
  } catch (error: any) {
    setStatus(
      error?.message ||
      "Transaction failed."
    );
    setSending(false);
  }
}



  function openMoonPay() {
    window.open(
      "https://moonpay.com",
      "_blank"
    );
  }

  function openBinance() {
    window.open(
      "https://binance.com",
      "_blank"
    );
  }
 
return (
    <main className="min-h-screen bg-black text-white px-4 py-8 flex justify-center">
      <div className="w-full max-w-md">

        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-4xl font-bold text-amber-400">
              CryptoHost
            </h1>

            <p className="text-zinc-400">
              All-in-One Dashboard
            </p>
          </div>

          <button
           onClick={() => {
    router.push(
    "/dashboard/security"
  );
}}
            className="px-4 py-2 rounded-xl bg-zinc-900"
          >
            Security
          </button>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 p-6 text-black mb-5">
          <p className="text-sm font-medium">
            Portfolio Balance
          </p>

          <p className="text-4xl font-bold mt-2">
            {ethBalance} ETH
          </p>

          <p className="text-sm mt-1">
            {bnbBalance} BNB
          </p>

          <p className="text-sm mt-1">
            {usdtBalance} USDT
          </p>
          {isConnected ? (
  <button
    onClick={() => disconnect()}
    className="mt-3 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
  >
    Disconnect
  </button>
) : (
  <button
    onClick={() => connect({ connector: connectors[0] })}
    className="mt-3 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
  >
    Connect  MetaMask
  </button>
)}
<div className="mt-3 flex items-center gap-2 flex-wrap">
  <p className="text-xs text-black/80 break-all">
    {currentWallet  || "No wallet loaded"}
  </p>
  <div className="mb-4">
  {isConnected ? (
    <button
      onClick={() => disconnect()}
      className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
    >
      Disconnect {address?.slice(0,6)}...{address?.slice(-4)}
    </button>
  ) : (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
    >
      Connect Trust Wallet
    </button>
  )}
</div>

</div>

  <button
    onClick={() => {
      if (walletAddress) {
        navigator.clipboard.writeText(walletAddress);
        alert("Wallet address copied!");
      }
    }}
    className="rounded-lg bg-black px-3 py-1 text-xs font-semibold text-white"
  >
    Copy
  </button>
</div>
          <p className="text-xs mt-3 break-all">
            {walletAddress}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() =>
              setShowReceive(true)
            }
            className="rounded-2xl bg-amber-500 py-4 text-black font-bold"
          >
            Receive
          </button>

          <button
            onClick={() =>
              setShowBuyModal(true)
            }
            className="rounded-2xl bg-zinc-900 py-4 font-bold"
          >
            Buy
          </button>

          <button
            onClick={() =>
              setShowSellModal(true)
            }
            className="rounded-2xl bg-zinc-900 py-4 font-bold"
          >
            Sell
          </button>

          <button
            onClick={loadWallet}
            className="rounded-2xl bg-zinc-900 py-4 font-bold"
          >
            Refresh
          </button>
        </div>
<Link
  href="/dashboard/history"
  className="block rounded-2xl bg-zinc-900 py-4 font-bold text-center mt-3"
>
  History
</Link>
        <div className="rounded-3xl bg-zinc-950 border border-white/10 p-5 mb-5">
          <p className="text-sm text-zinc-400 mb-4">
            Send Crypto
          </p>

          <select
            value={asset}
            onChange={(e) =>
              setAsset(
                e.target.value
              )
            }
            className="w-full rounded-2xl bg-black p-4 mb-3"
          >
            <option>ETH</option>
            <option>BNB</option>
            <option>USDT</option>
          </select>

          <input
            value={to}
            onChange={(e) =>
              setTo(
                e.target.value
              )
            }
            placeholder="Recipient Address"
            className="w-full rounded-2xl bg-black p-4 mb-3"
          />

          <input
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target.value
              )
            }
            placeholder="Amount"
            className="w-full rounded-2xl bg-black p-4 mb-3"
          />

          <p className="text-xs text-zinc-400 mb-3">
            Send Fee:
            {" "}
            {SEND_FEE}%
          </p>

       <button
  onClick={handleSend}
  disabled={sending}
  className="w-full rounded-2xl bg-amber-500 py-4 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed"
>
            {sending
              ? "Sending..."
              : `Send ${asset}`}
          </button>

          {status && (
            <p className="text-xs text-zinc-400 mt-3 break-all">
              {status}
            </p>
          )}
        </div>

        <div className="rounded-3xl bg-zinc-950 border border-white/10 p-5">
          <p className="text-sm text-zinc-400 mb-3">
            Fees
          </p>

          <div className="flex justify-between py-2 border-b border-white/5">
            <span>
              Buy
            </span>
            <span>
              {BUY_FEE}%
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-white/5">
            <span>
              Sell
            </span>
            <span>
              {SELL_FEE}%
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span>
              Receive
            </span>
            <span>
              Free
            </span>
          </div>
        </div>
      

      {showReceive && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-white/10 p-6 text-center">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              Receive
            </h2>

            <div className="bg-white p-4 rounded-2xl inline-block">
  <QRCodeSVG
    value={
      currentWallet?.trim() ||
      "0x0000000000000000000000000000000000000000"
    }
    size={260}
    bgColor="#FFFFFF"
    fgColor="#000000"
    level="H"
    includeMargin={true}
  />
</div>

            <p className="text-xs mt-4 break-all">
              {walletAddress}
            </p>

            <button
              onClick={() =>
                setShowReceive(
                  false
                )
              }
              className="mt-5 w-full rounded-2xl bg-amber-500 py-4 text-black font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showBuyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-amber-400 text-center mb-5">
              Buy Crypto
            </h2>

            <button
              onClick={openTransak}
              className="w-full rounded-2xl bg-amber-500 py-4 text-black font-bold mb-3"
            >
              Transak
            </button>

            <button
              onClick={openMoonPay}
              className="w-full rounded-2xl bg-zinc-900 py-4 font-bold mb-3"
            >
              MoonPay
            </button>

            <button
              onClick={() =>
                setShowBuyModal(false)
              }
              className="w-full rounded-2xl bg-zinc-800 py-4"
            >
              Close
            </button>
          </div>
        </div>
      )}

          {showSellModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-amber-400 text-center mb-5">
              Sell Crypto
            </h2>

            <button
              onClick={openBinance}
              className="w-full rounded-2xl bg-amber-500 py-4 text-black font-bold mb-3"
            >
              Binance
            </button>

            <button
              onClick={() =>
                setShowSellModal(false)
              }
              className="w-full rounded-2xl bg-zinc-800 py-4"
            >
              Close
            </button>
          </div>
        </div>
          )}
    </main>
  );
}