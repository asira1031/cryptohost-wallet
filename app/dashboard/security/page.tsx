"use client";

import { useEffect, useMemo, useState } from "react";
import * as QRCode from "qrcode";
import * as OTPAuth from "otpauth";

export default function TwoFASetupPage() {
  const [secret, setSecret] = useState<string | null>(null);
  const [qr, setQr] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let storedSecret = localStorage.getItem("2fa_temp_secret");

    if (!storedSecret) {
      storedSecret = new OTPAuth.Secret().base32;
      localStorage.setItem("2fa_temp_secret", storedSecret);
    }

    setSecret(storedSecret);
  }, []);

  const totp = useMemo(() => {
    if (!secret) return null;

    return new OTPAuth.TOTP({
      issuer: "CryptoHost",
      label: "user@cryptohost.com",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });
  }, [secret]);

  useEffect(() => {
    if (!totp) return;

    QRCode.toDataURL(totp.toString())
      .then((url: string) => setQr(url))
      .catch(() => setMessage("Failed to generate QR code."));
  }, [totp]);

  function verifyCode() {
    if (!totp || !secret) {
      setMessage("❌ Setup is not ready yet. Please refresh the page.");
      return;
    }

    try {
      const delta = totp.validate({
        token: code.trim(),
        window: 1,
      });

      if (delta !== null) {
        localStorage.setItem("2fa_secret", secret);
        localStorage.setItem("2fa_enabled", "true");
        localStorage.removeItem("2fa_temp_secret");

        setMessage(
          "✅ Authenticator successfully linked. Your account is now protected."
        );

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        setMessage(
          "❌ Invalid code. Please try again or check your phone time settings."
        );
      }
    } catch {
      setMessage("❌ Verification failed. Please scan the QR code again.");
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

      <p style={{ marginTop: 14, color: "#cbd5e1" }}>
        Step 1: Open Google Authenticator
      </p>
      <p style={{ color: "#cbd5e1" }}>
        Step 2: Tap "+" and scan the QR code
      </p>
      <p style={{ color: "#cbd5e1" }}>
        Step 3: Enter the 6-digit code below
      </p>

      <p style={{ marginTop: 10, color: "#facc15" }}>
        ⚠️ If the code is invalid, make sure your phone time is set to automatic.
      </p>

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