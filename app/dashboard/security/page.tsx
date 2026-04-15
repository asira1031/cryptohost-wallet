"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function SecuritySettings() {
  // ⚠️ Disabled states (kept only for UI)
  const [token, setToken] = useState("");

  // 🛑 Disabled function (no logic)
  const verifyAuthenticator = () => {
    return; // do nothing
  };

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
      {/* 🔐 TITLE */}
      <h2 className="text-lg font-semibold text-white">
        Setup Authenticator (Coming Soon)
      </h2>

      {/* 📱 QR CODE (DISPLAY ONLY) */}
      <div className="mt-4 flex flex-col items-center gap-4">
        <QRCodeSVG
          value="otpauth://totp/CryptoHost?secret=DISABLED123&issuer=CryptoHost"
          size={160}
        />

        {/* 🔑 MANUAL KEY */}
        <p className="text-sm text-gray-400">
          Manual key: <span className="text-white">DISABLED123</span>
        </p>

        {/* ⚠️ NOTICE */}
        <p className="text-yellow-400 text-sm text-center">
          ⚠️ Authenticator is currently disabled. Please use Email OTP for
          security.
        </p>

        {/* 🔢 INPUT (DISABLED) */}
        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled
          className="mt-2 w-full max-w-xs rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-center text-white opacity-50 cursor-not-allowed"
        />

        {/* 🚫 BUTTON (DISABLED) */}
        <button
          disabled
          className="mt-3 w-full max-w-xs rounded-lg bg-gray-600 px-4 py-2 text-white opacity-50 cursor-not-allowed"
        >
          Disabled
        </button>
      </div>
    </div>
  );
}