"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { clearWallet, getWallet, type StoredWallet } from "../lib/wallet-storage";

export default function MyWalletPage() {
  const [wallet, setWallet] = useState<StoredWallet | null>(null);

  useEffect(() => {
    const saved = getWallet();
    setWallet(saved);
  }, []);

  function handleClearWallet() {
    clearWallet();
    setWallet(null);
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>My CryptoHost Wallet</h1>
        <p style={subStyle}>
          View your generated/imported wallet details, seed phrase, private key, and QR code.
        </p>

        {!wallet ? (
          <div style={emptyBoxStyle}>
            <p style={{ margin: 0, color: "#cbd5e1" }}>
              No local wallet found on this device.
            </p>

            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              <Link href="/create-wallet" style={linkStyle}>
                Create Wallet
              </Link>
              <Link href="/import-wallet" style={linkStyle}>
                Import Wallet
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={boxStyle}>
              <strong>Wallet Address</strong>
              <div style={valueStyle}>{wallet.address}</div>
            </div>

            <div style={qrWrapStyle}>
              <QRCodeCanvas value={wallet.address} size={180} />
            </div>

            <div style={boxStyle}>
              <strong>12-Word Seed Phrase</strong>
              <div style={valueStyle}>
                {wallet.mnemonic || "No seed phrase stored for this imported private-key wallet."}
              </div>
            </div>

            <div style={boxStyle}>
              <strong>Private Key</strong>
              <div style={valueStyle}>{wallet.privateKey}</div>
            </div>

            <div style={boxStyle}>
              <strong>Created / Imported</strong>
              <div style={valueStyle}>{wallet.createdAt}</div>
            </div>

            <button style={dangerButtonStyle} onClick={handleClearWallet}>
              Clear Wallet From This Device
            </button>
          </div>
        )}

        <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
          <Link href="/create-wallet" style={linkStyle}>
            Create Wallet
          </Link>
          <Link href="/import-wallet" style={linkStyle}>
            Import Wallet
          </Link>
          <Link href="/dashboard" style={linkStyle}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#03113a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 820,
  background: "#13205a",
  borderRadius: 20,
  padding: 28,
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.08)",
};

const titleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 8,
};

const subStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.75)",
  marginBottom: 20,
};

const boxStyle: React.CSSProperties = {
  background: "#0b1220",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  padding: 16,
};

const emptyBoxStyle: React.CSSProperties = {
  background: "#0b1220",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  padding: 20,
};

const valueStyle: React.CSSProperties = {
  marginTop: 8,
  wordBreak: "break-word",
  lineHeight: 1.6,
  color: "#dbeafe",
};

const qrWrapStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 20,
  display: "inline-flex",
  width: "fit-content",
};

const dangerButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "none",
  background: "#b91c1c",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const linkStyle: React.CSSProperties = {
  color: "#93c5fd",
  textDecoration: "none",
  fontSize: 14,
};