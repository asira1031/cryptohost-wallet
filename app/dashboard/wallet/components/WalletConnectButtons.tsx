"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function WalletConnectButtons() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="mt-3 space-y-2">
      {!isConnected ? (
        <>
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="w-full rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Connect MetaMask
          </button>

          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="w-full rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Connect Trust Wallet
          </button>

          <p className="text-center text-xs text-white/70">
            Click to send
          </p>
        </>
      ) : (
        <button
          onClick={() => disconnect()}
          className="w-full rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Disconnect {address?.slice(0, 6)}...{address?.slice(-4)}
        </button>
      )}
    </div>
  );
}