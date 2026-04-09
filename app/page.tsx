"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import SendAssetCard from "./components/wallet/SendAssetCard";
import { NETWORKS } from "./lib/wallet/chains";
import { fetchUsdtBalance, getRpcProvider } from "./lib/wallet/erc20";
import type { SupportedNetworkKey } from "./types/wallet";

export default function Page() {
  const [privateKey, setPrivateKey] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedNetwork, setSelectedNetwork] =
    useState<SupportedNetworkKey>("ethereum");

  const [nativeBalance, setNativeBalance] = useState("0");
  const [usdtBalance, setUsdtBalance] = useState("0");

  const [importKeyInput, setImportKeyInput] = useState("");
  const [toast, setToast] = useState("");

  const currentNetwork = NETWORKS[selectedNetwork];

  useEffect(() => {
    const savedPrivateKey = localStorage.getItem("cryptohost_wallet_private_key");
    const savedAddress = localStorage.getItem("cryptohost_wallet_address");

    if (savedPrivateKey && savedAddress) {
      setPrivateKey(savedPrivateKey);
      setWalletAddress(savedAddress);
    }
  }, []);

  useEffect(() => {
    if (walletAddress) {
      refreshBalances();
    }
  }, [walletAddress, selectedNetwork]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(message: string) {
    setToast(message);
  }

  function generateWallet() {
    try {
      const wallet = ethers.Wallet.createRandom();

      setPrivateKey(wallet.privateKey);
      setWalletAddress(wallet.address);

      localStorage.setItem("cryptohost_wallet_private_key", wallet.privateKey);
      localStorage.setItem("cryptohost_wallet_address", wallet.address);

      showToast("New wallet generated successfully.");
    } catch (error) {
      console.error(error);
      showToast("Failed to generate wallet.");
    }
  }

  function importWallet() {
    try {
      const trimmed = importKeyInput.trim();
      if (!trimmed) {
        showToast("Please enter a private key.");
        return;
      }

      const normalized = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
      const wallet = new ethers.Wallet(normalized);

      setPrivateKey(wallet.privateKey);
      setWalletAddress(wallet.address);

      localStorage.setItem("cryptohost_wallet_private_key", wallet.privateKey);
      localStorage.setItem("cryptohost_wallet_address", wallet.address);

      setImportKeyInput("");
      showToast("Wallet imported successfully.");
    } catch (error) {
      console.error(error);
      showToast("Invalid private key.");
    }
  }

  function clearWallet() {
    localStorage.removeItem("cryptohost_wallet_private_key");
    localStorage.removeItem("cryptohost_wallet_address");

    setPrivateKey("");
    setWalletAddress("");
    setNativeBalance("0");
    setUsdtBalance("0");
    setImportKeyInput("");

    showToast("Wallet cleared.");
  }

  async function refreshBalances() {
    try {
      if (!walletAddress) return;

      const provider = getRpcProvider(selectedNetwork);
      const rawBalance = await provider.getBalance(walletAddress);
      const formattedNative = ethers.formatEther(rawBalance);

      setNativeBalance(Number(formattedNative).toFixed(6));

      try {
        const usdt = await fetchUsdtBalance(selectedNetwork, walletAddress);
        setUsdtBalance(Number(usdt).toFixed(6));
      } catch (tokenError) {
        console.error(tokenError);
        setUsdtBalance("0.000000");
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to refresh balances.");
    }
  }

  async function copyAddress() {
    try {
      if (!walletAddress) return;
      await navigator.clipboard.writeText(walletAddress);
      showToast("Wallet address copied.");
    } catch (error) {
      console.error(error);
      showToast("Failed to copy address.");
    }
  }

  const explorerAddressUrl = walletAddress
    ? `${currentNetwork.explorerAddress}${walletAddress}`
    : "";

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
            background: "#13205a",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            zIndex: 9999,
            boxShadow: "0 10px 24px rgba(0,0,0,0.28)",
          }}
        >
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            background: "#13205a",
            borderRadius: 20,
            padding: "28px 30px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            CryptoHost Wallet
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: "rgba(255,255,255,0.78)",
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            Local wallet lab for multi-chain wallet generation, import, balance
            checking, and safe asset sending.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "#13205a",
              borderRadius: 20,
              padding: 22,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Wallet Control</h2>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <button onClick={generateWallet} style={buttonPrimary}>
                Generate Wallet
              </button>

              <button onClick={clearWallet} style={buttonDanger}>
                Clear Wallet
              </button>

              <button onClick={refreshBalances} style={buttonSecondary}>
                Refresh Balances
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Import Private Key</label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="password"
                  value={importKeyInput}
                  onChange={(e) => setImportKeyInput(e.target.value)}
                  placeholder="Enter private key"
                  style={inputStyle}
                />
                <button onClick={importWallet} style={buttonPrimary}>
                  Import
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Selected Network</label>
              <select
                value={selectedNetwork}
                onChange={(e) =>
                  setSelectedNetwork(e.target.value as SupportedNetworkKey)
                }
                style={inputStyle}
              >
                <option value="ethereum">Ethereum</option>
                <option value="bsc">BNB Smart Chain</option>
                <option value="polygon">Polygon</option>
              </select>
            </div>

            <div style={infoCard}>
              <div style={infoRow}>
                <span style={infoLabel}>Address</span>
                <span style={infoValue}>
                  {walletAddress || "No wallet loaded"}
                </span>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                <button onClick={copyAddress} style={buttonSecondary}>
                  Copy Address
                </button>

                {walletAddress ? (
                  <a
                    href={explorerAddressUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={linkButton}
                  >
                    View on Explorer
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#13205a",
              borderRadius: 20,
              padding: 22,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Balances</h2>

            <div style={balanceBox}>
              <div style={balanceTitle}>
                {NETWORKS[selectedNetwork].symbol} Balance
              </div>
              <div style={balanceValue}>{nativeBalance}</div>
            </div>

            <div style={balanceBox}>
              <div style={balanceTitle}>USDT Balance</div>
              <div style={balanceValue}>{usdtBalance}</div>
            </div>

            <div style={infoCard}>
              <div style={infoRow}>
                <span style={infoLabel}>Network</span>
                <span style={infoValue}>{NETWORKS[selectedNetwork].label}</span>
              </div>

              <div style={infoRow}>
                <span style={infoLabel}>Chain ID</span>
                <span style={infoValue}>
                  {String(NETWORKS[selectedNetwork].chainId)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <SendAssetCard
          privateKey={privateKey}
          walletAddress={walletAddress}
          onRefreshBalances={refreshBalances}
        />
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontSize: 14,
  color: "rgba(255,255,255,0.85)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#0b1220",
  color: "#fff",
  outline: "none",
};

const buttonPrimary: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const buttonSecondary: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#0b1220",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const buttonDanger: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: "#b91c1c",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const infoCard: React.CSSProperties = {
  marginTop: 14,
  padding: 16,
  borderRadius: 14,
  background: "#0b1220",
  border: "1px solid rgba(255,255,255,0.08)",
};

const infoRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 10,
};

const infoLabel: React.CSSProperties = {
  color: "rgba(255,255,255,0.7)",
  fontSize: 14,
};

const infoValue: React.CSSProperties = {
  color: "#fff",
  fontSize: 14,
  textAlign: "right",
  wordBreak: "break-all",
};

const balanceBox: React.CSSProperties = {
  padding: 18,
  borderRadius: 16,
  background: "#0b1220",
  border: "1px solid rgba(255,255,255,0.08)",
  marginBottom: 14,
};

const balanceTitle: React.CSSProperties = {
  color: "rgba(255,255,255,0.72)",
  fontSize: 14,
  marginBottom: 8,
};

const balanceValue: React.CSSProperties = {
  color: "#fff",
  fontSize: 28,
  fontWeight: 800,
};

const linkButton: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#0b1220",
  color: "#93c5fd",
  fontWeight: 700,
  textDecoration: "none",
};