"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { ethers } from "ethers";
import { supabase } from "../lib/supabase/client";

type UserProfile = {
  email?: string;
  username?: string;
};

const TOKENS = [
  { symbol: "BTC", name: "Bitcoin", balance: "0.0000" },
  { symbol: "ETH", name: "Ethereum", balance: "0.0000" },
  { symbol: "BNB", name: "BNB", balance: "0.0000" },
  { symbol: "USDT", name: "Tether USD", balance: "0.0000" },
];

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [privateKey, setPrivateKey] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [showInstallNotice, setShowInstallNotice] = useState(true);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setUser({
        email: data.user.email ?? "",
        username: (data.user.user_metadata?.username as string) || "User",
      });
    }

    getUser();
  }, [router]);

  useEffect(() => {
    const savedKey = localStorage.getItem("cryptohost_wallet_private_key");
    const savedAddress = localStorage.getItem("cryptohost_wallet_address");

    if (savedKey && savedAddress) {
      setPrivateKey(savedKey);
      setWalletAddress(savedAddress);
      return;
    }

    const newWallet = ethers.Wallet.createRandom();
    localStorage.setItem("cryptohost_wallet_private_key", newWallet.privateKey);
    localStorage.setItem("cryptohost_wallet_address", newWallet.address);
    setPrivateKey(newWallet.privateKey);
    setWalletAddress(newWallet.address);
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function copyAddress() {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied("Wallet address copied.");
    setTimeout(() => setCopied(""), 1800);
  }

  async function copyPrivateKey() {
    if (!privateKey) return;
    await navigator.clipboard.writeText(privateKey);
    setCopied("Private key copied.");
    setTimeout(() => setCopied(""), 1800);
  }

  function regenerateWallet() {
    const newWallet = ethers.Wallet.createRandom();
    localStorage.setItem("cryptohost_wallet_private_key", newWallet.privateKey);
    localStorage.setItem("cryptohost_wallet_address", newWallet.address);
    setPrivateKey(newWallet.privateKey);
    setWalletAddress(newWallet.address);
    setCopied("New wallet generated.");
    setTimeout(() => setCopied(""), 1800);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#03113a",
        color: "#fff",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            background: "#13205a",
            borderRadius: 20,
            padding: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>
                CryptoHost Wallet
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
                Welcome, {user?.username || user?.email || "User"}
              </div>
            </div>

            <button onClick={logout} style={buttonSecondary}>
              Logout
            </button>
          </div>
        </div>

        {showInstallNotice && (
          <div
            style={{
              background: "#0f1b52",
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>Install CryptoHost Wallet</div>
              <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 14 }}>
                Add this app to your device for faster access.
              </div>
            </div>

            <button
              onClick={() => setShowInstallNotice(false)}
              style={buttonPrimary}
            >
              Okay
            </button>
          </div>
        )}

        <div
          style={{
            background: "#0f1b52",
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Notification</div>
          <div style={{ color: "rgba(255,255,255,0.75)" }}>
            Your wallet dashboard is active. Login, wallet access, and QR view
            are ready.
          </div>
          {copied ? (
            <div style={{ marginTop: 10, color: "#93c5fd", fontSize: 14 }}>
              {copied}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 0.9fr",
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
            <h2 style={{ marginTop: 0 }}>My Tokens</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
                marginBottom: 18,
              }}
            >
              {TOKENS.map((token) => (
                <div
                  key={token.symbol}
                  style={{
                    background: "#0b1220",
                    borderRadius: 16,
                    padding: 16,
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.68)" }}>
                    {token.name}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
                    {token.balance}
                  </div>
                  <div style={{ marginTop: 6, color: "#93c5fd" }}>
                    {token.symbol}
                  </div>
                </div>
              ))}
            </div>

            <div style={infoCard}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <div style={{ fontWeight: 700 }}>Wallet Address</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={copyAddress} style={buttonSecondary}>
                    Copy Address
                  </button>
                  <button onClick={regenerateWallet} style={buttonPrimary}>
                    New Wallet
                  </button>
                </div>
              </div>

              <div style={addressBox}>
                {walletAddress || "No wallet address saved."}
              </div>
            </div>

            <div style={infoCard}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <div style={{ fontWeight: 700 }}>Private Key</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setShowPrivateKey((prev) => !prev)}
                    style={buttonSecondary}
                  >
                    {showPrivateKey ? "Hide Private Key" : "Show Private Key"}
                  </button>
                  <button onClick={copyPrivateKey} style={buttonSecondary}>
                    Copy Private Key
                  </button>
                </div>
              </div>

              <div style={addressBox}>
                {!privateKey
                  ? "No private key saved."
                  : showPrivateKey
                  ? privateKey
                  : "••••••••••••••••••••••••••••••••••••••••••••••••••"}
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
            <h2 style={{ marginTop: 0 }}>Wallet QR</h2>

            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                minHeight: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
              }}
            >
              {walletAddress ? (
                <QRCodeSVG value={walletAddress} size={180} />
              ) : (
                <div style={{ color: "#111827", textAlign: "center" }}>
                  No wallet loaded yet
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 14,
                background: "#0b1220",
                border: "1px solid rgba(255,255,255,0.06)",
                wordBreak: "break-all",
                fontSize: 13,
              }}
            >
              {walletAddress || "No wallet address saved in local storage."}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

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

const infoCard: React.CSSProperties = {
  marginTop: 16,
  padding: 16,
  borderRadius: 16,
  background: "#0b1220",
  border: "1px solid rgba(255,255,255,0.06)",
};

const addressBox: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  background: "#07101d",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "#fff",
  wordBreak: "break-all",
  fontSize: 13,
};