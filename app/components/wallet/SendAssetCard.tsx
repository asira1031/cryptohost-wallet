"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import type { SupportedNetworkKey, TxHistoryItem } from "../../types/wallet";
import { NETWORKS } from "../../lib/wallet/chains";
import {
  estimateNativeGas,
  estimateUsdtGas,
  sendNative,
  sendUsdt,
} from "../../lib/wallet/erc20";
import {
  addHistoryItem,
  getStoredHistory,
  updateHistoryStatus,
} from "../../lib/wallet/history";
import { getExplorerTxUrl } from "../../lib/wallet/explorer";

type Props = {
  privateKey: string;
  walletAddress: string;
  onRefreshBalances?: () => Promise<void> | void;
};

type AssetOption = "NATIVE" | "USDT";

export default function SendAssetCard({
  privateKey,
  walletAddress,
  onRefreshBalances,
}: Props) {
  const [network, setNetwork] = useState<SupportedNetworkKey>("ethereum");
  const [asset, setAsset] = useState<AssetOption>("NATIVE");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [gasInfo, setGasInfo] = useState<null | {
    gasLimit: string;
    gasPrice: string;
    estimatedFeeWei: string;
    estimatedFeeNative: string;
  }>(null);
  const [estimating, setEstimating] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<TxHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getStoredHistory());
  }, []);

  const nativeSymbol = useMemo(() => NETWORKS[network].symbol, [network]);

  function reloadHistory() {
    setHistory(getStoredHistory());
  }

  function resetFeedback() {
    setMessage("");
    setError("");
  }

  function validateInput() {
    if (!privateKey) throw new Error("Missing wallet private key.");
    if (!walletAddress) throw new Error("Missing wallet address.");
    if (!to || !ethers.isAddress(to)) {
      throw new Error("Recipient address is invalid.");
    }
    if (!amount || Number(amount) <= 0) {
      throw new Error("Amount must be greater than 0.");
    }
  }

  async function handleEstimateGas() {
    resetFeedback();
    setEstimating(true);
    setGasInfo(null);

    try {
      validateInput();

      const result =
        asset === "NATIVE"
          ? await estimateNativeGas({
              network,
              fromPrivateKey: privateKey,
              to,
              amount,
            })
          : await estimateUsdtGas({
              network,
              fromPrivateKey: privateKey,
              to,
              amount,
            });

      setGasInfo(result);
      setMessage("Gas estimated successfully.");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to estimate gas.";
      setError(msg);
    } finally {
      setEstimating(false);
    }
  }

  async function handleSend() {
    resetFeedback();
    setSending(true);

    try {
      validateInput();

      const tx =
        asset === "NATIVE"
          ? await sendNative({
              network,
              fromPrivateKey: privateKey,
              to,
              amount,
            })
          : await sendUsdt({
              network,
              fromPrivateKey: privateKey,
              to,
              amount,
            });

      const item: TxHistoryItem = {
        hash: tx.hash,
        network,
        type: "send",
        assetSymbol: asset === "NATIVE" ? nativeSymbol : "USDT",
        amount,
        to,
        from: walletAddress,
        status: "pending",
        timestamp: Date.now(),
        explorerUrl: getExplorerTxUrl(network, tx.hash),
      };

      addHistoryItem(item);
      reloadHistory();

      setMessage(`Transaction submitted: ${tx.hash}`);

      const receipt = await tx.wait();

      updateHistoryStatus(tx.hash, receipt?.status === 1 ? "confirmed" : "failed");
      reloadHistory();

      if (receipt?.status === 1) {
        setMessage("Transaction confirmed.");
        setAmount("");
        setTo("");
        setGasInfo(null);
        await onRefreshBalances?.();
      } else {
        setError("Transaction failed on-chain.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed.";
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: 20,
        color: "#fff",
        marginTop: 24,
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>Send Assets</h2>

      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Network</label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as SupportedNetworkKey)}
            style={inputStyle}
          >
            <option value="ethereum">Ethereum</option>
            <option value="bsc">BNB Smart Chain</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Asset</label>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value as AssetOption)}
            style={inputStyle}
          >
            <option value="NATIVE">{nativeSymbol}</option>
            <option value="USDT">USDT</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6 }}>
            Recipient Address
          </label>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6 }}>
            Amount ({asset === "NATIVE" ? nativeSymbol : "USDT"})
          </label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={handleEstimateGas}
            disabled={estimating || sending}
            style={buttonStyle}
          >
            {estimating ? "Estimating..." : "Estimate Gas"}
          </button>

          <button
            onClick={handleSend}
            disabled={sending || estimating}
            style={buttonStyle}
          >
            {sending
              ? "Sending..."
              : `Send ${asset === "NATIVE" ? nativeSymbol : "USDT"}`}
          </button>
        </div>

        {gasInfo && (
          <div style={boxStyle}>
            <div>
              <strong>Gas Limit:</strong> {gasInfo.gasLimit}
            </div>
            <div>
              <strong>Gas Price (wei):</strong> {gasInfo.gasPrice}
            </div>
            <div>
              <strong>Estimated Fee:</strong> {gasInfo.estimatedFeeNative}{" "}
              {nativeSymbol}
            </div>
          </div>
        )}

        {message ? <div style={{ color: "#86efac" }}>{message}</div> : null}
        {error ? <div style={{ color: "#fca5a5" }}>{error}</div> : null}
      </div>

      <div style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 12 }}>Transaction History</h3>

        <div style={{ display: "grid", gap: 12 }}>
          {history.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No transactions yet.</div>
          ) : (
            history.map((tx) => (
              <div key={tx.hash} style={boxStyle}>
                <div>
                  <strong>Asset:</strong> {tx.assetSymbol}
                </div>
                <div>
                  <strong>Network:</strong> {NETWORKS[tx.network].label}
                </div>
                <div>
                  <strong>Amount:</strong> {tx.amount}
                </div>
                <div>
                  <strong>To:</strong> {tx.to}
                </div>
                <div>
                  <strong>Status:</strong> {tx.status}
                </div>
                <div>
                  <a
                    href={tx.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#93c5fd" }}
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#0b1220",
  color: "#fff",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

const boxStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  background: "#0b1220",
  border: "1px solid rgba(255,255,255,0.08)",
};