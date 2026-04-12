"use client";

import { useState } from "react";
import { Wallet } from "ethers";
import Link from "next/link";
import { saveWallet } from "../lib/wallet-storage";

export default function ImportWalletPage() {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [message, setMessage] = useState("");

  function handleImportFromSeed() {
    try {
      const wallet = Wallet.fromPhrase(seedPhrase.trim());
      localStorage.setItem(
  "cryptohost_wallet",
  JSON.stringify({
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase || seedPhrase
  })
);

      saveWallet({
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: seedPhrase.trim(),
        createdAt: new Date().toISOString(),
      });

      setMessage("Wallet imported successfully from seed phrase.");
    } catch (error: any) {
      setMessage(error?.message || "Invalid seed phrase.");
    }
  }

  function handleImportFromPrivateKey() {
    try {
      let cleanedKey = privateKeyInput.trim();

if (!cleanedKey.startsWith("0x")) {
  cleanedKey = "0x" + cleanedKey;
}

const wallet = new Wallet(cleanedKey);

      saveWallet({
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: "",
        createdAt: new Date().toISOString(),
      });

      setMessage("Wallet imported successfully from private key.");
    } catch (error: any) {
      setMessage(error?.message || "Invalid private key.");
    }
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Import CryptoHost Wallet</h1>
        <p style={subStyle}>
          Import a wallet using either a 12-word seed phrase or a private key.
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          <textarea
            style={textareaStyle}
            placeholder="Paste 12-word seed phrase here"
            value={seedPhrase}
            onChange={(e) => setSeedPhrase(e.target.value)}
          />

          <button style={buttonStyle} onClick={handleImportFromSeed}>
            Import from Seed Phrase
          </button>

          <input
            style={inputStyle}
            placeholder="Paste private key here"
            value={privateKeyInput}
            onChange={(e) => setPrivateKeyInput(e.target.value)}
          />

          <button
            style={{ ...buttonStyle, background: "#2563eb", color: "#fff" }}
            onClick={handleImportFromPrivateKey}
          >
            Import from Private Key
          </button>
        </div>

        {message ? <p style={messageStyle}>{message}</p> : null}

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

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 110,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#0b1220",
  color: "#fff",
  resize: "vertical",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#0b1220",
  color: "#fff",
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

const linkStyle: React.CSSProperties = {
  color: "#93c5fd",
  textDecoration: "none",
  fontSize: 14,
};

const messageStyle: React.CSSProperties = {
  marginTop: 14,
  color: "#c7d2fe",
};