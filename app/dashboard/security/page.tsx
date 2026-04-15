"use client";

import { useEffect, useState } from "react";
import * as QRCode from "qrcode";
import { generateSecret, generateURI, verify } from "otplib";

export default function TwoFASetupPage() {
  const [secret, setSecret] = useState("");
  const [qr, setQr] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const newSecret = generateSecret();
    setSecret(newSecret);

    const otpauth = `otpauth://totp/CryptoHost:user@cryptohost.com?secret=${newSecret}&issuer=CryptoHost`;

    QRCode.toDataURL(otpauth)
      .then((url: string) => setQr(url))
      .catch(() => setMessage("Failed to generate QR code."));
  }, []);

  async function verifyCode() {
    const result = await verify({
      token: code,
      secret,
    });

    if (result.valid) {
      localStorage.setItem("2fa_secret", secret);
      localStorage.setItem("2fa_enabled", "true");
      setMessage("✅ Authenticator linked successfully!");
    } else {
      setMessage("❌ Invalid code, try again.");
    }
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Setup Authenticator</h2>

      {qr ? (
        <img
          src={qr}
          alt="QR Code"
          style={{
            marginTop: 16,
            marginBottom: 16,
            background: "white",
            padding: 12,
            borderRadius: 12,
          }}
        />
      ) : (
        <p>Generating QR code...</p>
      )}

<p style={{ marginTop: 12, color: "#cbd5e1" }}>
  Manual key: <strong>{secret}</strong>
</p>
      <p>Scan this QR with Google Authenticator</p>

      <input
        type="text"
        inputMode="numeric"
        placeholder="Enter 6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #334155",
          background: "#0f172a",
          color: "white",
          display: "block",
          marginTop: 12,
          marginBottom: 12,
          width: 260,
        }}
      />

      <button
        onClick={verifyCode}
        style={{
          padding: "10px 16px",
          borderRadius: 10,
          border: "none",
          background: "#2563eb",
          color: "white",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Verify
      </button>

      {message && <p style={{ marginTop: 14 }}>{message}</p>}
    </div>
  );
}