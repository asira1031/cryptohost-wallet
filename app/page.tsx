"use client";

import React, { useMemo, useState } from "react";
import { ethers } from "ethers";
import { QRCodeSVG } from "qrcode.react";

type WalletData = {
  address: string;
  privateKey: string;
  mnemonic?: string;
};

type TxItem = {
  type: "Received" | "Sent";
  token: string;
  amount: string;
  address: string;
  status: "Completed" | "Pending";
  date: string;
};

export default function HomePage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [toast, setToast] = useState("");
  const [hidePrivateKey, setHidePrivateKey] = useState(true);
  const [hideSeedPhrase, setHideSeedPhrase] = useState(true);
  const [importKey, setImportKey] = useState("");

  const shortAddress = useMemo(() => {
    if (!wallet?.address) return "";
    return `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`;
  }, [wallet]);

  const transactions: TxItem[] = [
    {
      type: "Received",
      token: "USDT",
      amount: "0.00",
      address: "0x8F3c...21A9",
      status: "Completed",
      date: "2026-04-08 10:45 AM",
    },
    {
      type: "Sent",
      token: "ETH",
      amount: "0.00",
      address: "0xA9D2...90B7",
      status: "Pending",
      date: "2026-04-07 04:20 PM",
    },
    {
      type: "Received",
      token: "BNB",
      amount: "0.00",
      address: "0x12CF...5D44",
      status: "Completed",
      date: "2026-04-06 09:12 AM",
    },
  ];

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 1800);
  }

  function generateWallet() {
    const newWallet = ethers.Wallet.createRandom();

    setWallet({
      address: newWallet.address,
      privateKey: newWallet.privateKey,
      mnemonic: newWallet.mnemonic?.phrase,
    });

    setImportKey("");
    setHidePrivateKey(true);
    setHideSeedPhrase(true);
    showToast("New wallet generated");
  }

  function importWalletFromPrivateKey() {
    try {
      const cleanKey = importKey.trim();

      if (!cleanKey) {
        showToast("Enter a private key first");
        return;
      }

      const imported = new ethers.Wallet(cleanKey);

      setWallet({
        address: imported.address,
        privateKey: imported.privateKey,
        mnemonic: "Imported by private key",
      });

      setImportKey("");
      setHidePrivateKey(true);
      setHideSeedPhrase(true);
      showToast("Wallet imported");
    } catch {
      showToast("Invalid private key");
    }
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied`);
    } catch {
      showToast("Copy failed");
    }
  }

  function maskValue(hidden: boolean, value: string) {
    return hidden ? "••••••••••••••••••••••••••••••••••••••••" : value;
  }

  return (
    <main
      style={{
        background: "#03113a",
        minHeight: "100vh",
        padding: 30,
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            background: "#12317d",
            border: "1px solid #2b4ca3",
            borderRadius: 12,
            padding: "12px 16px",
            fontWeight: 700,
            zIndex: 1000,
            boxShadow: "0 10px 24px rgba(0,0,0,0.28)",
          }}
        >
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>CryptoHost Wallet</h1>
        <p style={{ margin: 0, opacity: 0.82, fontSize: 15 }}>
          Secure digital wallet interface — testing mode
        </p>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #081a52 0%, #0d245f 100%)",
          border: "1px solid #1d3b8b",
          borderRadius: 20,
          padding: 22,
          marginBottom: 24,
          boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: "#ffffff",
                opacity: 0.78,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Wallet Address
            </div>

            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 8,
              }}
            >
              {wallet ? shortAddress : "No wallet yet"}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#ffffff",
                opacity: 0.82,
                wordBreak: "break-all",
                marginBottom: 14,
              }}
            >
              {wallet
                ? `Full Address: ${wallet.address}`
                : "Generate or import a wallet to begin"}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  if (!wallet) {
                    showToast("Load a wallet first");
                    return;
                  }
                  copy(wallet.address, "Address");
                }}
                style={blueButton}
              >
                Copy Address
              </button>

              <button
                type="button"
                onClick={generateWallet}
                style={outlineButton}
              >
                Generate Wallet
              </button>
            </div>
          </div>

          <div style={{ minWidth: 220, textAlign: "right" }}>
            <div
              style={{
                fontSize: 13,
                color: "#ffffff",
                opacity: 0.78,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Portfolio Value
            </div>

            <div
              style={{
                fontSize: 34,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              $0.00
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#ffffff",
                opacity: 0.82,
                marginTop: 6,
              }}
            >
              Testing mode only
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#08153f",
          border: "1px solid #1a2f74",
          borderRadius: 18,
          padding: 20,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 14,
            color: "#ffffff",
          }}
        >
          Import Wallet
        </div>

        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "#ffffff",
            opacity: 0.82,
          }}
        >
          Private Key
        </label>

        <textarea
          value={importKey}
          onChange={(e) => setImportKey(e.target.value)}
          placeholder="Paste private key here"
          style={{
            width: "100%",
            minHeight: 110,
            background: "#0a1d52",
            border: "1px solid #1f3e92",
            color: "#ffffff",
            borderRadius: 12,
            padding: "12px 14px",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
            resize: "vertical",
            marginBottom: 14,
          }}
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={importWalletFromPrivateKey}
            style={buttonPrimary}
          >
            Import Wallet
          </button>

          <button
            type="button"
            onClick={() => setImportKey("")}
            style={outlineButton}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 14,
            color: "#ffffff",
          }}
        >
          Token Balances
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {[
            { symbol: "USDT", name: "Tether USD" },
            { symbol: "ETH", name: "Ethereum" },
            { symbol: "BNB", name: "BNB Smart Chain" },
          ].map((token) => (
            <div
              key={token.symbol}
              style={{
                background: "#08153f",
                border: "1px solid #1a2f74",
                borderRadius: 18,
                padding: 18,
                boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {token.symbol}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>{token.name}</div>
                </div>

                <div
                  style={{
                    background: "#102867",
                    color: "#7fb3ff",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "6px 10px",
                    borderRadius: 999,
                  }}
                >
                  Active
                </div>
              </div>

              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
                0.00
              </div>
              <div style={{ fontSize: 14, opacity: 0.78 }}>$0.00</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 14,
            color: "#ffffff",
          }}
        >
          Recent Transactions
        </div>

        <div
          style={{
            background: "#08153f",
            border: "1px solid #1a2f74",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr 1.4fr 1fr 1.2fr",
              gap: 12,
              padding: "14px 18px",
              background: "#0d1d52",
              color: "#8ea7d8",
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <div>Type</div>
            <div>Amount</div>
            <div>Address</div>
            <div>Status</div>
            <div>Date</div>
          </div>

          {transactions.map((tx, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1fr 1.4fr 1fr 1.2fr",
                gap: 12,
                padding: "16px 18px",
                borderTop: index === 0 ? "none" : "1px solid #14265f",
                alignItems: "center",
                fontSize: 14,
                color: "#ffffff",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{tx.type}</div>
                <div style={{ fontSize: 12, opacity: 0.78, marginTop: 3 }}>
                  {tx.token}
                </div>
              </div>

              <div>{tx.amount}</div>
              <div style={{ opacity: 0.78 }}>{tx.address}</div>

              <div>
                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    background:
                      tx.status === "Completed" ? "#11361f" : "#4b3a0f",
                    color:
                      tx.status === "Completed" ? "#6ee7a8" : "#ffd76a",
                  }}
                >
                  {tx.status}
                </span>
              </div>

              <div style={{ opacity: 0.78, fontSize: 13 }}>{tx.date}</div>
            </div>
          ))}
        </div>
      </div>

      {wallet && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "#08153f",
              padding: 20,
              borderRadius: 16,
              border: "1px solid #132b6b",
            }}
          >
            <h3 style={{ marginBottom: 20 }}>Wallet Details</h3>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                Wallet Address
              </div>
              <div style={valueBox}>{wallet.address}</div>
              <button
                type="button"
                onClick={() => copy(wallet.address, "Address")}
                style={outlineButton}
              >
                Copy
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={rowBetween}>
                <div style={{ fontWeight: 700 }}>Private Key</div>
                <button
                  type="button"
                  onClick={() => setHidePrivateKey((v) => !v)}
                  style={outlineButton}
                >
                  {hidePrivateKey ? "Show" : "Hide"}
                </button>
              </div>

              <div style={valueBox}>{maskValue(hidePrivateKey, wallet.privateKey)}</div>

              <button
                type="button"
                onClick={() => copy(wallet.privateKey, "Private key")}
                style={outlineButton}
              >
                Copy
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={rowBetween}>
                <div style={{ fontWeight: 700 }}>Seed Phrase</div>
                <button
                  type="button"
                  onClick={() => setHideSeedPhrase((v) => !v)}
                  style={outlineButton}
                >
                  {hideSeedPhrase ? "Show" : "Hide"}
                </button>
              </div>

              <div style={valueBox}>
                {maskValue(
                  hideSeedPhrase,
                  wallet.mnemonic || "Imported by private key"
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  copy(wallet.mnemonic || "Imported by private key", "Seed phrase")
                }
                style={outlineButton}
              >
                Copy
              </button>
            </div>
          </div>

          <div
            style={{
              background: "#08153f",
              padding: 20,
              borderRadius: 16,
              textAlign: "center",
              border: "1px solid #132b6b",
            }}
          >
            <h3 style={{ marginBottom: 20 }}>QR Code</h3>

            <div
              style={{
                background: "#fff",
                padding: 12,
                borderRadius: 12,
                display: "inline-block",
              }}
            >
              <QRCodeSVG value={wallet.address} size={200} />
            </div>

            <p style={{ marginTop: 15 }}>{shortAddress}</p>
          </div>
        </div>
      )}
    </main>
  );
}

const buttonPrimary: React.CSSProperties = {
  background: "#1b5cff",
  color: "#ffffff",
  border: "none",
  borderRadius: 12,
  padding: "12px 22px",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(27, 92, 255, 0.28)",
};

const blueButton: React.CSSProperties = {
  background: "#12317d",
  color: "#ffffff",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

const outlineButton: React.CSSProperties = {
  background: "transparent",
  color: "#ffffff",
  border: "1px solid #2b4ca3",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

const valueBox: React.CSSProperties = {
  background: "#0a1d52",
  padding: 12,
  borderRadius: 10,
  marginBottom: 8,
  wordBreak: "break-all",
  border: "1px solid #16357f",
};

const rowBetween: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  marginBottom: 6,
};