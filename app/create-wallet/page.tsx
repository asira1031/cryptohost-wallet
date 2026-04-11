"use client";

import { useState } from "react";
import { Wallet } from "ethers";
import Link from "next/link";
import { saveWallet } from "../lib/wallet-storage";

export default function CreateWalletPage() {
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [message, setMessage] = useState("");

  function handleCreateWallet() {
    try {
      const wallet = Wallet.createRandom();

      const phrase = wallet.mnemonic?.phrase || "";

      setAddress(wallet.address);
      setPrivateKey(wallet.privateKey);
      setMnemonic(phrase);

      saveWallet({
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: phrase,
        createdAt: new Date().toISOString(),
      });

      setMessage("Wallet created and saved locally on this device.");
    } catch (error: any) {
      setMessage(error?.message || "Failed to create wallet.");
    }
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Create CryptoHost Wallet</h1>
        <p style={subStyle}>
          Generate a new wallet with seed phrase and private key.
        </p>

        <button style={buttonStyle} onClick={handleCreateWallet}>
          Generate Wallet
        </button>

        {message ? <p style={messageStyle}>{message}</p> : null}

        {address ? (
          <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
            <div style={boxStyle}>
              <strong>Wallet Address</strong>
              <div style={valueStyle}>{address}</div>
            </div>

            <div style={boxStyle}>
              <strong>12-Word Seed Phrase</strong>
              <div style={valueStyle}>{mnemonic}</div>
            </div>

            <div style={boxStyle}>
              <strong>Private Key</strong>
              <div style={valueStyle}>{privateKey}</div>
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
          <Link href="/my-wallet" style={linkStyle}>
            Go to My Wallet
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
  maxWidth: 760,
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

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "none",
  background: "#06b6d4",
  color: "#04101f",
  fontWeight: 700,
  cursor: "pointer",
};

const boxStyle: React.CSSProperties = {
  background: "#0b1220",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  padding: 16,
};

const valueStyle: React.CSSProperties = {
  marginTop: 8,
  wordBreak: "break-word",
  lineHeight: 1.6,
  color: "#dbeafe",
};

const linkStyle: React.CSSProperties = {
  color: "#93c5fd",
  textDecoration: "none",
  fontSize: 14,
};

const messageStyle: React.CSSProperties = {
  marginTop: 14,
  color: "#c7d2fe",
};